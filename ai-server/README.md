# Vanna AI Server for FlowbitAI Analytics

## Requirements
- Python 3.9+
- PostgreSQL database connection
- Groq API key

## Setup
1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Unix
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints
- POST `/chat` - Process natural language queries
- GET `/health` - Health check
- GET `/schema` - Get database schema info

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: Groq API key for LLM
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins