
  # FlowbitAI Analytics Dashboard

A production-grade full-stack analytics dashboard with AI-powered natural language querying capabilities.

## 🚀 Features

- **Interactive Analytics Dashboard** - Real-time business intelligence with charts and KPIs
- **AI Chat with Data** - Natural language querying using Groq LLM
- **Invoice Management** - Complete invoice processing and management system
- **Document Management** - Upload, process, and analyze business documents
- **Department Analytics** - Track spending and performance across departments
- **User Management** - Role-based access control and user administration
- **Real-time Data** - Live updates and responsive data visualization

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **AI Server**: Python FastAPI with Groq LLM integration
- **Authentication**: JWT-based auth system

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.9+
- PostgreSQL 14+
- Groq API Key

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Mukul2956/flowbit-ai.git
cd flowbit-ai
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb flowbitai_analytics

# Or using psql
psql -U postgres -c "CREATE DATABASE flowbitai_analytics;"
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run db:seed
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

### 5. AI Server Setup
```bash
cd ai-server
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Groq API key and database credentials
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/flowbitai_analytics"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"
```

### AI Server (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/flowbitai_analytics"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.1-8b-instant"
PORT=8000
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: AI Server
cd ai-server && python main.py
```

### Production Mode
```bash
# Build and start backend
cd backend && npm run build && npm start

# Build and start frontend
cd frontend && npm run build && npm start

# Start AI server
cd ai-server && python main.py
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Server: http://localhost:8000

## 📊 Data Ingestion

To populate the dashboard with sample data:

```bash
cd backend
npm run ingest-data data/Analytics_Test_Data.json
npm run add-realistic-amounts
```

## 🤖 AI Chat Features

The AI chat can answer questions like:
- "How many invoices do we have?"
- "What's our total spend this month?"
- "Show me the top 5 vendors by spending"
- "How many overdue invoices are there?"

## 🔄 API Endpoints

### Analytics
- `GET /api/analytics/stats` - Dashboard statistics
- `GET /api/analytics/trends` - Spending trends
- `GET /api/analytics/departments` - Department analytics

### Invoices
- `GET /api/invoices` - List invoices with pagination
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload documents

## 🛡️ Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For support, email support@flowbitai.com or create an issue on GitHub.
  