from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import asyncio

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')))
logger = logging.getLogger(__name__)

# Import Vanna and Groq
try:
    import vanna as vn
    from groq import Groq
    import pandas as pd
except ImportError as e:
    logger.error(f"Failed to import required packages: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="FlowbitAI Vanna Server",
    description="Natural language to SQL query service for FlowbitAI Analytics",
    version="1.0.0"
)

# CORS middleware
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    sql: str
    results: Optional[Any] = None
    explanation: str
    success: bool
    error: Optional[str] = None

# Initialize Vanna and Groq
groq_client = None
vanna_instance = None

def init_services():
    """Initialize Vanna and Groq services"""
    global groq_client, vanna_instance
    
    try:
        # Initialize Groq client
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        groq_client = Groq(api_key=groq_api_key)
        logger.info("Groq client initialized successfully")
        
        # Initialize Vanna with PostgreSQL
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        # Configure Vanna to use Groq as LLM
        vanna_instance = vn.get_vanna(
            model='groq',
            api_key=groq_api_key
        )
        
        # Connect to PostgreSQL database
        vanna_instance.connect_to_postgres(
            host=database_url.split('@')[1].split(':')[0] if '@' in database_url else 'localhost',
            dbname=database_url.split('/')[-1],
            user=database_url.split('://')[1].split(':')[0] if '://' in database_url else 'postgres',
            password=database_url.split('://')[1].split('@')[0].split(':')[1] if '://' in database_url else '',
            port=int(database_url.split('@')[1].split(':')[1].split('/')[0]) if '@' in database_url else 5432
        )
        
        logger.info("Vanna instance initialized and connected to database")
        
        # Train Vanna with schema information
        train_vanna()
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

def train_vanna():
    """Train Vanna with database schema and sample queries"""
    try:
        if not vanna_instance:
            raise ValueError("Vanna instance not initialized")
        
        # Add documentation about the database schema
        schema_docs = [
            "The database contains invoice and vendor data for analytics.",
            "Main tables: vendors, invoices, line_items, payments, customers",
            "Vendors table contains vendor information with id, name, email, category",
            "Invoices table contains invoice data with amounts, dates, status", 
            "Line_items table contains individual items within invoices",
            "Payments table tracks payments made against invoices",
            "Invoice status can be: PENDING, PAID, OVERDUE, CANCELLED, DRAFT"
        ]
        
        for doc in schema_docs:
            vanna_instance.train(documentation=doc)
        
        # Add sample SQL queries for common questions
        training_data = [
            {
                "question": "What is the total spend this year?",
                "sql": "SELECT SUM(total_amount) FROM invoices WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND status = 'PAID'"
            },
            {
                "question": "Who are the top 5 vendors by spend?", 
                "sql": "SELECT v.name, SUM(i.total_amount) as total_spend FROM vendors v JOIN invoices i ON v.id = i.vendor_id WHERE i.status = 'PAID' GROUP BY v.id, v.name ORDER BY total_spend DESC LIMIT 5"
            },
            {
                "question": "How many invoices were processed this month?",
                "sql": "SELECT COUNT(*) FROM invoices WHERE EXTRACT(MONTH FROM issue_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE)"
            },
            {
                "question": "What are the overdue invoices?",
                "sql": "SELECT invoice_number, vendor_id, total_amount, due_date FROM invoices WHERE status = 'PENDING' AND due_date < CURRENT_DATE"
            }
        ]
        
        for item in training_data:
            vanna_instance.train(question=item["question"], sql=item["sql"])
            
        logger.info("Vanna training completed successfully")
        
    except Exception as e:
        logger.error(f"Failed to train Vanna: {e}")
        # Don't raise here, allow service to continue even if training fails

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    init_services()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        if vanna_instance:
            # Simple query to test connection
            result = vanna_instance.run_sql("SELECT 1 as test")
            db_status = "connected" if result is not None else "disconnected"
        else:
            db_status = "not_initialized"
            
        return {
            "status": "healthy",
            "database": db_status,
            "groq": "connected" if groq_client else "disconnected",
            "vanna": "initialized" if vanna_instance else "not_initialized"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/schema")
async def get_schema():
    """Get database schema information"""
    try:
        if not vanna_instance:
            raise HTTPException(status_code=500, detail="Vanna not initialized")
        
        # Get table information
        tables_info = vanna_instance.run_sql("""
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position
        """)
        
        return {"schema": tables_info}
    except Exception as e:
        logger.error(f"Error getting schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_with_data(request: ChatRequest):
    """Process natural language query and return SQL + results"""
    try:
        if not vanna_instance:
            raise HTTPException(status_code=500, detail="Vanna not initialized")
        
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logger.info(f"Processing question: {question}")
        
        # Generate SQL from natural language
        sql_query = vanna_instance.generate_sql(question)
        logger.info(f"Generated SQL: {sql_query}")
        
        if not sql_query or sql_query.strip().lower().startswith('select') == False:
            return ChatResponse(
                sql=sql_query or "",
                success=False,
                explanation="Could not generate a valid SELECT query from your question. Please rephrase or be more specific.",
                error="Invalid SQL generated"
            )
        
        # Execute the SQL query
        try:
            results = vanna_instance.run_sql(sql_query)
            
            # Convert results to a more friendly format
            if results is not None and not results.empty:
                results_dict = results.to_dict('records')
                explanation = f"Found {len(results_dict)} result(s) for your query."
            else:
                results_dict = []
                explanation = "Query executed successfully but returned no results."
            
            return ChatResponse(
                sql=sql_query,
                results=results_dict,
                explanation=explanation,
                success=True
            )
            
        except Exception as sql_error:
            logger.error(f"SQL execution error: {sql_error}")
            return ChatResponse(
                sql=sql_query,
                success=False,
                explanation=f"Error executing the generated SQL query: {str(sql_error)}",
                error=str(sql_error)
            )
            
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            sql="",
            success=False,
            explanation="An error occurred while processing your question. Please try again.",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)