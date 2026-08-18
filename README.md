# 🧠 CortexAI - Intelligent Multi-Agent Chat Platform

<div align="center">

![CortexAI Banner](https://img.shields.io/badge/CortexAI-AI%20Powered-blueviolet?style=for-the-badge&logo=openai)
[![Deployment](https://github.com/Ni3een/CORTEXAI-Multi-Ai-Agent/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ni3een/CORTEXAI-Multi-Ai-Agent/actions/workflows/deploy.yml)
[![PR Check](https://github.com/Ni3een/CORTEXAI-Multi-Ai-Agent/actions/workflows/pr-check.yml/badge.svg)](https://github.com/Ni3een/CORTEXAI-Multi-Ai-Agent/actions/workflows/pr-check.yml)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![AWS](https://img.shields.io/badge/AWS-ECS%20Deployed-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**Every thread, one train of thought.**

[Demo](#-demo) • [Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment)

</div>

---

## 📖 About

CortexAI is a production-ready, AI-powered chat application that leverages **multiple specialized agents** to handle diverse tasks. Built with a **microservices architecture** and deployed on **AWS ECS**, it combines the power of modern LLMs (Large Language Models) with advanced techniques like **RAG (Retrieval Augmented Generation)** for document analysis.

### 🎯 Key Highlights

- 🤖 **8 Specialized AI Agents** - Chat, Search, Coding, PDF, PPT, Vision, PDF RAG, Image Analyzer
- 🏗️ **Microservices Architecture** - 5 independent services (Gateway, Auth, Chat, Agent, Billing)
- 🐳 **Fully Dockerized** - Production-ready containerization
- ☁️ **AWS ECS Deployment** - Scalable cloud infrastructure with ALB
- 📚 **RAG Implementation** - Vector database (Qdrant) + embeddings for document Q&A
- 🔄 **CI/CD Pipeline** - Automated deployment with GitHub Actions
- 🎨 **Modern Frontend** - React + Redux + TailwindCSS

---

## ✨ Features

### 🤖 AI Agents

| Agent | Description | Technology |
|-------|-------------|------------|
| 💬 **Chat** | General conversation and Q&A | Google Gemini Pro |
| 🔍 **Search** | Real-time web search integration | Tavily API + Gemini |
| 💻 **Coding** | Code generation with artifacts | Gemini Pro |
| 📄 **PDF Generator** | Professional PDF creation | PDFKit + AWS S3 |
| 📊 **PPT Generator** | Presentation generation | PptxGenJS + S3 |
| 🖼️ **Vision** | AI image generation | DALL-E 3 |
| 📚 **PDF RAG** | Upload & analyze PDFs | Qdrant + Embeddings |
| 🖼️ **Image Analyzer** | Detailed image understanding | Gemini Vision |

### 🎨 User Experience

- ✅ **Persistent Conversations** - Save and resume chats
- ✅ **File Upload** - PDF analysis with RAG
- ✅ **Image Generation & Analysis** - Visual AI capabilities
- ✅ **Code Artifacts** - Interactive code blocks with syntax highlighting
- ✅ **Real-time Responses** - Streaming AI responses
- ✅ **Credit System** - Usage tracking and billing
- ✅ **Google OAuth** - Secure authentication via Firebase

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│  React Frontend │
│  (Redux State)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         AWS Application Load Balancer       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Gateway Service    │
         │  (Port 8000)        │
         │  - Auth Middleware  │
         │  - Request Routing  │
         └─────────┬───────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────────┐
│  Auth  │    │  Chat  │    │   Agent    │
│ :4001  │    │ :4002  │    │   :4003    │
└────────┘    └────────┘    └─────┬──────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │   LangGraph      │
                        │   Router         │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
                 [Chat]      [Search]     [Coding]
                 [PDF]       [PPT]        [Vision]
                 [PDF RAG]   [Image Analyzer]
```

### Microservices Breakdown

| Service | Port | Responsibility | Tech Stack |
|---------|------|----------------|------------|
| **Gateway** | 8000 | API Gateway, Authentication, Routing | Express, JWT |
| **Auth** | 4001 | User management, Firebase integration | Express, MongoDB |
| **Chat** | 4002 | Conversation & message management | Express, MongoDB |
| **Agent** | 4003 | AI agent orchestration (LangGraph) | Express, LangChain |
| **Billing** | 4004 | Credits, payments (Stripe) | Express, MongoDB |

---

## 🔬 RAG (Retrieval Augmented Generation) Pipeline

One of the most powerful features is the **PDF RAG Agent** that allows users to upload PDFs and ask questions:

```
1. PDF Upload
   ↓
2. Text Extraction (pdf-parse)
   ↓
3. Text Chunking
   • Chunk Size: 1000 characters
   • Overlap: 200 characters
   • RecursiveCharacterTextSplitter
   ↓
4. Embeddings Generation
   • Model: gemini-embedding-001
   • Dimensions: 768
   ↓
5. Vector Storage (Qdrant)
   • Unique collection per PDF
   • Fast similarity search
   ↓
6. User Query
   ↓
7. Similarity Search
   • Cosine similarity
   • Top-5 relevant chunks
   ↓
8. Context Building
   • Concatenate relevant chunks
   ↓
9. LLM Query (Gemini Pro)
   • System: "Answer ONLY from PDF"
   • Context + User question
   ↓
10. Accurate Response
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Redux Toolkit** - State management
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client
- **React Markdown** - Message formatting
- **Monaco Editor** - Code editor integration

### Backend
- **Node.js + Express** - Server framework
- **MongoDB** - Database (conversations, users)
- **Redis** - Caching & conversation memory
- **LangChain** - LLM orchestration
- **LangGraph** - Agent workflow management

### AI/ML
- **Google Gemini Pro** - Primary LLM
- **Gemini Embeddings** - Text embeddings (768d)
- **Qdrant** - Vector database
- **Tavily API** - Web search
- **DALL-E 3** - Image generation

### Infrastructure
- **Docker** - Containerization
- **AWS ECS** - Container orchestration
- **AWS ECR** - Container registry
- **AWS ALB** - Load balancing
- **AWS S3** - File storage
- **GitHub Actions** - CI/CD pipeline

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis
- API Keys:
  - Google AI API key (Gemini)
  - Tavily API key
  - Firebase credentials
  - AWS credentials (for S3)
  - Qdrant instance

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cortexai.git
cd cortexai
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Gateway
cd gateway
npm install

# Services
cd services/auth && npm install
cd ../chat && npm install
cd ../agent && npm install
cd ../billing && npm install

# Frontend
cd ../../frontend
npm install
```

3. **Environment Variables**

Create `.env` files in each service directory:

**Gateway (.env)**
```env
PORT=8000
FRONTEND_URL=http://localhost:5173
AUTH_SERVICE=http://localhost:4001
CHAT_SERVICE=http://localhost:4002
AGENT_SERVICE=http://localhost:4003
BILLING_SERVICE=http://localhost:4004
JWT_SECRET=your_jwt_secret
```

**Auth Service (.env)**
```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/cortexai
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
```

**Agent Service (.env)**
```env
PORT=4003
MONGODB_URI=mongodb://localhost:27017/cortexai
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
QDRANT_URL=http://localhost:6333
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

4. **Start Redis**
```bash
docker compose up -d
```

5. **Run Services**

Open separate terminals for each:

```bash
# Terminal 1 - Gateway
cd backend/gateway
npm run dev

# Terminal 2 - Auth
cd backend/services/auth
npm run dev

# Terminal 3 - Chat
cd backend/services/chat
npm run dev

# Terminal 4 - Agent
cd backend/services/agent
npm run dev

# Terminal 5 - Billing
cd backend/services/billing
npm run dev

# Terminal 6 - Frontend
cd frontend
npm run dev
```

6. **Access the application**
```
Frontend: http://localhost:5173
Gateway: http://localhost:8000
```

---

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Gateway
docker build -f backend/gateway/Dockerfile -t gateway backend

# Auth Service
docker build -f backend/services/auth/Dockerfile -t auth-service backend

# Chat Service
docker build -f backend/services/chat/Dockerfile -t chat-service backend

# Agent Service
docker build -f backend/services/agent/Dockerfile -t agent-service backend

# Billing Service
docker build -f backend/services/billing/Dockerfile -t billing-service backend
```

### Run Containers

```bash
docker run -d -p 8000:8000 --env-file backend/gateway/.env gateway
docker run -d -p 4001:4001 --env-file backend/services/auth/.env auth-service
docker run -d -p 4002:4002 --env-file backend/services/chat/.env chat-service
docker run -d -p 4003:4003 --env-file backend/services/agent/.env agent-service
docker run -d -p 4004:4004 --env-file backend/services/billing/.env billing-service
```

---

## ☁️ AWS Deployment

### Architecture Components

- **ECS Cluster** - `cortex-ai-cluster`
- **Services** - 5 ECS services (one per microservice)
- **Task Definitions** - Container specifications
- **ALB** - Application Load Balancer with target groups
- **ECR** - Container image registry
- **VPC** - Private networking

### CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment:

```yaml
Push to main
  ↓
GitHub Actions Trigger
  ↓
Build Docker Images
  ↓
Push to ECR
  ↓
Update ECS Services
  ↓
Rolling Deployment (Zero Downtime)
```

### Setup Steps

1. **Create ECR Repositories**
```bash
aws ecr create-repository --repository-name gateway
aws ecr create-repository --repository-name auth-service
aws ecr create-repository --repository-name chat-service
aws ecr create-repository --repository-name agent-service
aws ecr create-repository --repository-name billing-service
```

2. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name cortex-ai-cluster
```

3. **Create Task Definitions** (see AWS console or Terraform)

4. **Create ALB and Target Groups**

5. **Configure GitHub Secrets**
- `AWS_ACCESS_KEY`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ECS_CLUSTER`
- Service names

6. **Push to main branch** - Automatic deployment!

---

## 📊 System Design Document

For a detailed system design explanation (including RAG pipeline, microservices architecture, AWS infrastructure, and interview preparation), see:

📄 **[SYSTEM_DESIGN_HINGLISH.md](./SYSTEM_DESIGN_HINGLISH.md)**

This document covers:
- Complete architecture breakdown
- Microservices deep dive
- RAG implementation details
- AWS ECS/ECR/ALB setup
- Docker deployment workflow
- Interview preparation guide

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Firebase integration for OAuth
- ✅ Protected API routes (middleware)
- ✅ CORS configuration
- ✅ Environment variable isolation
- ✅ AWS IAM roles for ECS tasks
- ✅ Security groups for network isolation

---

## 📈 Scalability

### Current Capacity
- Handles concurrent users via ECS auto-scaling
- Redis for fast conversation retrieval
- MongoDB for persistent storage
- S3 for static file hosting

### Future Improvements
- 🔄 Queue system (SQS/RabbitMQ) for async agent processing
- 📊 MongoDB replica set for high availability
- 🚀 Redis cluster for distributed caching
- 📡 CloudFront CDN for frontend assets
- 📈 Horizontal scaling with ECS task count
- 🔍 ElasticSearch for conversation search

---

## 💰 Cost Optimization

Approximate monthly costs (AWS):
- **ECS**: $20-30 (t3.medium instances)
- **ECR**: $1-2 (image storage)
- **ALB**: $18-20
- **MongoDB Atlas**: $0 (free tier) or $25 (M10)
- **API Costs**: ~$1-2 (Gemini, Tavily)

**Total**: ~$70-100/month for production workload

---

## 🧪 Testing

```bash
# Backend tests
cd backend/services/agent
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📝 API Documentation

### Gateway Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/register` | User registration | ❌ |
| GET | `/api/me` | Get current user | ✅ |
| GET | `/api/chat/conversations` | List conversations | ✅ |
| GET | `/api/chat/messages/:id` | Get messages | ✅ |
| POST | `/api/agent/invoke` | Invoke AI agent | ✅ |
| GET | `/api/billing/credits` | Get user credits | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) - LLM framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model
- [Qdrant](https://qdrant.tech/) - Vector database
- [Tavily](https://tavily.com/) - Search API
- [AWS](https://aws.amazon.com/) - Cloud infrastructure

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Home Screen
![Home Screen](./screenshots/home.png)

### Chat Interface
![Chat Interface](./screenshots/chat.png)

### PDF RAG
![PDF RAG](./screenshots/pdf-rag.png)

### Code Generation
![Code Generation](./screenshots/coding.png)

</details>

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Plugin system for custom agents
- [ ] Self-hosted deployment guide

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Built with ❤️ using AI and modern web technologies**

</div>
