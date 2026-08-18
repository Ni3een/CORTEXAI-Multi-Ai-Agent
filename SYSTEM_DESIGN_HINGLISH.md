# 🚀 CortexAI - Complete System Design (Hinglish Edition)

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Microservices Deep Dive](#microservices-deep-dive)
4. [AWS Infrastructure](#aws-infrastructure)
5. [Docker & Deployment](#docker--deployment)
6. [RAG & PDF Processing](#rag--pdf-processing)
7. [Interview ke liye Key Points](#interview-ke-liye-key-points)

---

## 🎯 Project Overview

**CortexAI** ek AI-powered chat application hai jo multiple specialized agents use karta hai different tasks ke liye.

### Main Features:
- 💬 **Chat**: General conversation with AI
- 🔍 **Search**: Web search integration (Tavily API)
- 💻 **Coding**: Code generation aur explanation
- 📄 **PDF Generation**: Professional PDFs create karna
- 📊 **PPT Generation**: Presentations banana
- 🖼️ **Vision**: Image analysis
- 📚 **PDF RAG**: Upload PDF aur usse questions poocho (Vector DB use karke)
- 🖼️ **Image Analyzer**: Detailed image analysis

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  Components: Chat UI, Message Bubbles, File Upload, Auth       │
│  State: Redux (conversations, messages, user data)             │
│  Styling: TailwindCSS                                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS Application Load Balancer                 │
│              (Entry point for all backend traffic)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY SERVICE                          │
│  Port: 8000                                                     │
│  Role: Request routing, Authentication, Load distribution      │
│  Routes:                                                        │
│    /api/auth      → Auth Service                               │
│    /api/chat      → Chat Service (Protected)                   │
│    /api/agent     → Agent Service (Protected)                  │
│    /api/billing   → Billing Service (Protected)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │ Chat Service │  │Agent Service │
│   Port:4001  │  │  Port: 4002  │  │  Port: 4003  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                 ┌─────────────────┐
                 │ Billing Service │
                 │   Port: 4004    │
                 └─────────────────┘
```

---

## 🔧 Microservices Deep Dive

### 1️⃣ **Gateway Service** (API Gateway)

**Kya karta hai?**
- Entry point for all requests
- Authentication check karta hai (JWT verify)
- Requests ko appropriate service mein forward karta hai (Proxy pattern)

**Key Features:**
```javascript
// Routes configuration
app.use("/api/auth", proxy(AUTH_SERVICE))           // No auth needed
app.use("/api/chat", protect, proxy(CHAT_SERVICE))  // Protected
app.use("/api/agent", protect, proxy(AGENT_SERVICE)) // Protected
app.use("/api/billing", protect, proxy(BILLING_SERVICE)) // Protected
```

**Authentication Flow:**
1. User request aati hai
2. Gateway `protect` middleware run karta hai
3. JWT token verify hota hai
4. User ID extract hoke header mein add hota hai: `x-user-id`
5. Request forward hoti hai service ko

**Tech Stack:**
- Express.js
- express-http-proxy (for routing)
- cookie-parser (JWT from cookies)
- CORS enabled (frontend se communication ke liye)

---

### 2️⃣ **Auth Service**

**Kya karta hai?**
- User registration & login
- Firebase Authentication integration
- JWT token generation
- User profile management

**Flow:**
```
1. User Google se login karta hai (Firebase)
   ↓
2. Firebase ID token milta hai
   ↓
3. Backend verify karta hai Firebase token
   ↓
4. MongoDB mein user create/find hota hai
   ↓
5. JWT token generate hota hai
   ↓
6. Cookie mein token set hota hai
   ↓
7. User data return hota hai
```

**Database Schema:**
```javascript
User: {
  name: String,
  email: String,
  avatar: String,
  plan: String (free/pro),
  credits: Number,
  firebaseUid: String
}
```

---

### 3️⃣ **Chat Service**

**Kya karta hai?**
- Conversations manage karta hai
- Messages save karta hai MongoDB mein
- User ke saare chats ko track karta hai

**Database Schema:**
```javascript
Conversation: {
  userId: ObjectId,
  title: String,
  messages: [MessageId],
  createdAt: Date,
  updatedAt: Date
}

Message: {
  conversationId: ObjectId,
  role: String (user/assistant),
  content: String,
  images: [String],      // Image URLs
  artifacts: [Object],   // Code artifacts
  createdAt: Date
}
```

**Key Operations:**
- `POST /create-conversation`: New chat start
- `POST /save-message`: Message save karna
- `GET /conversations`: User ke saare chats
- `GET /messages/:id`: Particular chat ke messages

---

### 4️⃣ **Agent Service** ⭐ (MOST IMPORTANT)

**Kya karta hai?**
Ye sabse intelligent service hai. Isme **LangGraph** use hota hai jo multiple AI agents ko orchestrate karta hai.

#### **LangGraph Architecture:**

```
User Query
    ↓
┌─────────────┐
│   ROUTER    │  ← Decide karna: Kaunsa agent use karna hai?
└─────────────┘
    │
    ├──→ Chat Agent      (General conversation)
    ├──→ Search Agent    (Web search + Chat)
    ├──→ Coding Agent    (Code generation)
    ├──→ PDF Agent       (PDF generation)
    ├──→ PPT Agent       (Presentation generation)
    ├──→ Vision Agent    (Image generation - DALL-E)
    ├──→ PDF RAG Agent   (PDF analysis with vector DB)
    └──→ Image Analyzer  (Image understanding)
```

#### **Router Logic:**
```javascript
// Frontend se agent type aata hai
const { prompt, agent, conversationId, file } = req.body;

// Router decide karta hai
switch(agent) {
  case "chat": → Chat Agent
  case "search": → Search Agent → Chat Agent
  case "coding": → Coding Agent
  case "pdf": → PDF Agent
  case "pdfRag": → PDF RAG Agent
  // ... etc
}
```

#### **Agent Details:**

**A) Chat Agent:**
- Google Gemini Pro model use karta hai
- Conversation history maintain karta hai (Redis memory)
- General Q&A, explanations, discussions

**B) Search Agent:**
- **Tavily Search API** use karta hai (real-time web search)
- Search results milte hain
- Phir Chat Agent ko pass hota hai for summarization

**C) Coding Agent:**
- Code generate karta hai with explanations
- Multiple languages support (Python, JS, Java, etc.)
- **Artifacts** return karta hai:
```javascript
artifacts: [{
  title: "Button.jsx",
  language: "javascript",
  code: "// React component code..."
}]
```

**D) PDF Agent:**
- Structured JSON generate karta hai (title, sections, points)
- **PDFKit** library se PDF banata hai
- **AWS S3** mein upload karta hai
- Pre-signed URL generate karta hai (10 min expiry)

**E) PDF RAG Agent:** ⭐ (INTERVIEW FAVORITE)
This is the most important for interviews!

```
Step 1: PDF Upload
    ↓
Step 2: PDF Parse (pdf-parse library)
    ↓
Step 3: Text Splitting
    ├─ Chunk Size: 1000 characters
    ├─ Overlap: 200 characters
    └─ RecursiveCharacterTextSplitter use hota hai
    ↓
Step 4: Embeddings Generation
    ├─ Google Generative AI Embeddings
    ├─ Model: gemini-embedding-001
    └─ Har chunk ka vector representation
    ↓
Step 5: Vector Store
    ├─ Qdrant Vector Database
    ├─ Collection create hota hai
    └─ Vectors store hote hain
    ↓
Step 6: User Query
    ↓
Step 7: Similarity Search
    ├─ Query ko embed karte hain
    ├─ Top 5 similar chunks find karte hain
    └─ Cosine similarity use hota hai
    ↓
Step 8: Context Building
    ├─ Relevant chunks join karte hain
    └─ Context: "chunk1\n\nchunk2\n\n..."
    ↓
Step 9: LLM Call
    ├─ System Prompt: "Answer ONLY from PDF"
    ├─ Context + User Query
    └─ Gemini generates answer
    ↓
Step 10: Response
```

**F) Vision Agent:**
- DALL-E 3 use karta hai
- Image generate karta hai based on prompt
- AWS S3 mein upload
- URL return

**G) Image Analyzer:**
- Gemini Vision model
- Images ko analyze karta hai
- Detailed description deta hai

#### **Memory Management:**
```javascript
// Redis se conversation history fetch
const history = await getMessages(conversationId);

// LLM ko dete hain
const messages = [
  new SystemMessage("You are CortexAI..."),
  ...history,  // Previous messages
  new HumanMessage(userPrompt)
];
```

#### **Credit System:**
- Har agent ka different cost hai
- `deductCredits()` function call hota hai
- User ki credits reduce hoti hain
- Rate limiting bhi hai (abuse prevent karne ke liye)

---

### 5️⃣ **Billing Service**

**Kya karta hai?**
- Stripe integration for payments
- Credits management
- Subscription plans (Free/Pro)

**Operations:**
- `GET /credits`: User ki remaining credits
- `POST /purchase`: Stripe payment
- `POST /webhook`: Stripe webhook for payment confirmation

---

## ☁️ AWS Infrastructure

### **Architecture:**

```
┌────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS                       │
│  Trigger: Push to main branch                          │
│  Actions: Build → Tag → Push to ECR → Deploy to ECS   │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│                AWS ECR (Elastic Container Registry)     │
│  Repositories:                                          │
│    • gateway:latest                                     │
│    • auth-service:latest                                │
│    • chat-service:latest                                │
│    • agent-service:latest                               │
│    • billing-service:latest                             │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│          AWS ECS (Elastic Container Service)           │
│  Cluster: cortex-ai-cluster                            │
│  Services:                                              │
│    ┌──────────────────────────────────────┐           │
│    │ Service: gateway-service             │           │
│    │ Task Definition: gateway-task        │           │
│    │ Desired Count: 1                     │           │
│    │ Container: gateway (Port 8000)       │           │
│    │ Image: ECR/gateway:latest            │           │
│    └──────────────────────────────────────┘           │
│                                                         │
│    ┌──────────────────────────────────────┐           │
│    │ Service: auth-service                │           │
│    │ Container: auth (Port 4001)          │           │
│    └──────────────────────────────────────┘           │
│                                                         │
│    ┌──────────────────────────────────────┐           │
│    │ Service: chat-service                │           │
│    │ Container: chat (Port 4002)          │           │
│    └──────────────────────────────────────┘           │
│                                                         │
│    ┌──────────────────────────────────────┐           │
│    │ Service: agent-service               │           │
│    │ Container: agent (Port 4003)         │           │
│    └──────────────────────────────────────┘           │
│                                                         │
│    ┌──────────────────────────────────────┐           │
│    │ Service: billing-service             │           │
│    │ Container: billing (Port 4004)       │           │
│    └──────────────────────────────────────┘           │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│      Application Load Balancer (ALB)                   │
│  Listeners:                                             │
│    • Port 80/443 (HTTPS)                               │
│  Target Groups:                                         │
│    ┌──────────────────────────────────────┐           │
│    │ gateway-tg (Port 8000)               │           │
│    │   Targets: Gateway ECS Tasks         │           │
│    │   Health Check: /                    │           │
│    │   Path: /* → Gateway                 │           │
│    └──────────────────────────────────────┘           │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│                     VPC (Virtual Private Cloud)         │
│  Subnets:                                               │
│    • Public Subnet (ALB)                               │
│    • Private Subnet (ECS Tasks)                        │
│  Security Groups:                                       │
│    • ALB SG: Allow 80/443 from Internet               │
│    • ECS SG: Allow 8000 from ALB                      │
└────────────────────────────────────────────────────────┘
```

### **ECS Deep Dive:**

**ECS Kya hai?**
- Elastic Container Service
- Docker containers ko manage karta hai at scale
- Kubernetes ka alternative (but simpler)

**Key Concepts:**

1. **Cluster:**
   - Logical grouping of services
   - `cortex-ai-cluster`

2. **Service:**
   - Service ensures desired number of tasks running rehte hain
   - Auto-healing: Agar container crash ho, new start hota hai
   - Load balancing
   - Auto-scaling possible

3. **Task Definition:**
   - Blueprint for containers
   - Define karta hai:
     - Container image (ECR URL)
     - CPU & Memory limits
     - Port mappings
     - Environment variables
     - Logs configuration (CloudWatch)

4. **Task:**
   - Running instance of Task Definition
   - Actual container jo run ho raha hai

**Example Task Definition (Gateway):**
```json
{
  "family": "gateway-task",
  "containerDefinitions": [
    {
      "name": "gateway",
      "image": "123456.dkr.ecr.us-east-1.amazonaws.com/gateway:latest",
      "cpu": 256,
      "memory": 512,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "AUTH_SERVICE",
          "value": "http://auth-service:4001"
        },
        {
          "name": "CHAT_SERVICE",
          "value": "http://chat-service:4002"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gateway",
          "awslogs-region": "us-east-1"
        }
      }
    }
  ]
}
```

### **ALB (Application Load Balancer):**

**Kya karta hai?**
- Internet se traffic receive karta hai
- SSL/TLS termination (HTTPS)
- Health checks
- Traffic ko ECS tasks mein distribute karta hai

**Target Group:**
- Gateway service ko register karta hai
- Health check endpoint: `GET /`
- Unhealthy targets ko traffic nahi milti

**Listener Rules:**
```
Port 443 (HTTPS)
  ↓
Rule 1: Path /* → gateway-target-group
```

### **Service Discovery:**

**Problem:** Microservices ek dusre ko kaise find karein?

**Solution:** AWS Cloud Map + ECS Service Discovery

```javascript
// Gateway environment variables
AUTH_SERVICE=http://auth-service.cortex.local:4001
CHAT_SERVICE=http://chat-service.cortex.local:4002
AGENT_SERVICE=http://agent-service.cortex.local:4003
```

**Kaise kaam karta hai?**
1. ECS service create karte waqt "Service Discovery" enable karte hain
2. AWS Cloud Map mein DNS entry create hoti hai
3. Services internal DNS se ek dusre ko call kar sakte hain
4. Private network (VPC) mein hota hai

---

## 🐳 Docker & Deployment

### **Dockerfile Structure:**

**Gateway Dockerfile:**
```dockerfile
FROM node                    # Base image

WORKDIR /app                 # Working directory

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install gateway dependencies
COPY ./gateway/package*.json ./gateway/
RUN cd gateway && npm install

# Copy source code
COPY gateway ./gateway
COPY shared ./shared         # Shared modules (Redis, utils)

WORKDIR /app/gateway         # Change to gateway directory

EXPOSE 8000                  # Expose port

CMD [ "npm","start" ]        # Start command
```

**Why separate COPY commands?**
- Docker layer caching
- Agar code change ho, dependencies re-install nahi honge
- Build time kam hota hai

### **Docker Compose (Local Development):**

```yaml
services:
  redis:
    image: redis
    ports:
      - 6379:6379
```

**Development Flow:**
```bash
# Start Redis
docker compose up

# Run services locally (separate terminals)
cd backend/gateway && npm run dev
cd backend/services/auth && npm run dev
cd backend/services/chat && npm run dev
cd backend/services/agent && npm run dev
cd backend/services/billing && npm run dev

# Frontend
cd frontend && npm run dev
```

### **CI/CD Pipeline (GitHub Actions):**

**Workflow File:** `.github/workflows/deploy.yml`

**Steps:**

```
1. Trigger: Push to main branch
   ↓
2. Checkout code
   ↓
3. Configure AWS Credentials
   ├─ Access Key
   ├─ Secret Key
   └─ Region
   ↓
4. Login to ECR
   aws ecr get-login-password | docker login
   ↓
5. Build Docker Images (for each service)
   docker build -f backend/gateway/Dockerfile -t gateway backend
   ↓
6. Tag Images
   docker tag gateway:latest {AWS_ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com/gateway:latest
   ↓
7. Push to ECR
   docker push {AWS_ACCOUNT}.dkr.ecr.{REGION}.amazonaws.com/gateway:latest
   ↓
8. Force ECS Deployment
   aws ecs update-service --cluster cortex-ai-cluster \
     --service gateway-service --force-new-deployment
   ↓
9. ECS pulls new image from ECR
   ↓
10. Rolling update (zero downtime)
    ├─ New task start hota hai
    ├─ Health check pass
    ├─ Old task terminate
    └─ Deployment complete
```

**Secrets Management:**
```yaml
env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}
```

GitHub Secrets mein store hoti hain:
- AWS_ACCESS_KEY
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- ECS_CLUSTER
- Service names

---

## 📚 RAG & PDF Processing (MOST IMPORTANT FOR INTERVIEWS!)

### **RAG Kya Hai?**

**RAG = Retrieval Augmented Generation**

**Problem:**
- LLMs ko sirf training data tak access hai
- Naye documents ya private data ko LLM nahi jaanta
- Hallucination: LLM galat information de sakta hai

**Solution: RAG**
- Document ko chunks mein break karo
- Embeddings generate karo (vector representations)
- Vector database mein store karo
- User query aaye to relevant chunks retrieve karo
- LLM ko context ke saath query do
- LLM accurate answer dega based on provided context

### **CortexAI PDF RAG Pipeline:**

#### **Step 1: PDF Upload**
```javascript
// Frontend se file upload
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('agent', 'pdfRag');
formData.append('prompt', userQuestion);
```

#### **Step 2: PDF Parsing**
```javascript
import { PDFParse } from 'pdf-parse';

const buffer = fs.readFileSync(file.path);
const pdf = new PDFParse({ data: buffer });
const result = await pdf.getText();
const text = result.text;

// Output: "This is a sample PDF content..."
```

#### **Step 3: Text Chunking**

**Why chunking?**
- Large documents ko ek saath process nahi kar sakte
- Embeddings ka size limit hai
- Relevant information easily retrieve hoti hai

```javascript
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // Har chunk 1000 characters
  chunkOverlap: 200     // 200 characters overlap (context maintain)
});

const docs = await splitter.createDocuments([text]);

// Output:
// [
//   { pageContent: "Chunk 1 content...", metadata: {} },
//   { pageContent: "Chunk 2 content...", metadata: {} },
//   ...
// ]
```

**Overlap kyu?**
- Agar important information chunk boundary pe hai
- Overlap se context loss nahi hota

#### **Step 4: Embeddings Generation**

**Embedding Kya Hai?**
- Text ka numerical representation (vector)
- Similar meaning wale text ke vectors bhi similar hote hain
- Example:
  - "Cat" → [0.2, 0.8, 0.1, ..., 0.5]
  - "Kitten" → [0.21, 0.79, 0.12, ..., 0.51]
  - "Car" → [0.9, 0.1, 0.8, ..., 0.2]

```javascript
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001"  // Google's embedding model
});

// Har chunk ka embedding generate hota hai
// Output: 768-dimensional vector
```

#### **Step 5: Vector Store (Qdrant)**

**Qdrant Kya Hai?**
- Vector database (specialized for embeddings)
- Fast similarity search
- Scalable

```javascript
import { QdrantVectorStore } from "@langchain/qdrant";

const collectionName = `pdf-${Date.now()}`;  // Unique collection

const store = await QdrantVectorStore.fromDocuments(
  docs,                    // Chunked documents
  embeddings,              // Embedding model
  {
    url: process.env.QDRANT_URL,
    collectionName
  }
);

// Qdrant mein store ho gaya:
// Collection: pdf-1234567890
// Vectors: [
//   { id: 1, vector: [0.1, 0.2, ...], payload: { text: "chunk 1" } },
//   { id: 2, vector: [0.3, 0.4, ...], payload: { text: "chunk 2" } },
//   ...
// ]
```

#### **Step 6: User Query**
```javascript
const userQuery = "What is the main topic of this PDF?";
```

#### **Step 7: Similarity Search**

**Kaise kaam karta hai?**
1. User query ka embedding generate karo
2. Qdrant mein cosine similarity search karo
3. Top K (5) most similar vectors retrieve karo

```javascript
const relevantDocs = await store.similaritySearch(userQuery, 5);

// relevantDocs = [
//   { pageContent: "Most relevant chunk", score: 0.95 },
//   { pageContent: "Second relevant chunk", score: 0.87 },
//   { pageContent: "Third relevant chunk", score: 0.82 },
//   { pageContent: "Fourth relevant chunk", score: 0.78 },
//   { pageContent: "Fifth relevant chunk", score: 0.71 }
// ]
```

**Cosine Similarity:**
```
similarity = (A · B) / (||A|| × ||B||)

Where:
- A = Query embedding
- B = Document chunk embedding
- Range: -1 to 1 (1 = exactly similar)
```

#### **Step 8: Context Building**
```javascript
const context = relevantDocs
  .map(doc => doc.pageContent)
  .join("\n\n");

// context = "Chunk 1 text...\n\nChunk 2 text...\n\nChunk 3 text..."
```

#### **Step 9: LLM Call**
```javascript
const messages = [
  new SystemMessage(`
    You are CortexAI PDF Assistant.
    Rules:
    - Answer ONLY from the uploaded PDF.
    - Never make up information.
    - If answer not in PDF, say: "I couldn't find this in the PDF."
  `),
  new HumanMessage(`
    Context: ${context}
    
    Question: ${userQuery}
  `)
];

const response = await llm.invoke(messages);
```

**LLM ab context ke saath answer dega:**
- Accurate answer based on PDF content
- No hallucination
- Source information available

#### **Step 10: Cleanup**
```javascript
// Temporary file delete
fs.unlinkSync(file.path);
```

### **RAG vs Fine-tuning:**

| Aspect | RAG | Fine-tuning |
|--------|-----|-------------|
| **Training** | No training needed | Expensive training |
| **Updates** | Real-time updates | Need retraining |
| **Cost** | Low | High |
| **Accuracy** | High for documents | High for patterns |
| **Use Case** | Q&A, Documents | Specialized tasks |

---

## 🎤 Interview ke liye Key Points

### **Opening Statement (30 seconds):**

*"Maine CortexAI project develop kiya hai jo ek AI-powered chat application hai. Isme **microservices architecture** use kiya hai with **5 independent services** - Gateway, Auth, Chat, Agent aur Billing. Backend **Docker containers** mein run hota hai jo **AWS ECS** pe deployed hai. Main highlight **Agent service** hai jisme **LangGraph** use karke **8 different AI agents** implement kiye hain - Chat, Search, Coding, PDF generation, aur sabse interesting **PDF RAG** jo vector database (Qdrant) aur embeddings use karke uploaded PDFs se questions answer karta hai. Frontend **React** mein hai aur **Redux** se state management hai. Complete **CI/CD pipeline** GitHub Actions se setup hai jo automatically **ECR** mein images push karta hai aur **ECS** pe deploy karta hai."*

### **Technical Deep Dive Points:**

#### **1. Microservices Architecture:**
- **Single Responsibility**: Har service ka ek specific kaam
- **Independent Deployment**: Ek service update ho, baaki ko affect nahi
- **Scalability**: Load ke according individual services scale kar sakte hain
- **Technology Freedom**: Har service different tech stack use kar sakti hai

#### **2. API Gateway Pattern:**
- **Why needed?** 
  - Direct service calls se tight coupling hota
  - Authentication har service mein repeat hota
  - CORS issues
- **Benefits:**
  - Single entry point
  - Centralized authentication
  - Request routing
  - Load balancing

#### **3. Docker Benefits:**
- **Consistency**: "Works on my machine" problem solve
- **Isolation**: Har service apne environment mein
- **Portability**: Kahin bhi deploy (local, AWS, GCP)
- **Resource efficiency**: VMs se lightweight

#### **4. AWS ECS vs EC2:**
| Feature | ECS | EC2 |
|---------|-----|-----|
| Management | Managed | Manual |
| Scaling | Auto-scaling | Manual setup |
| Cost | Pay for usage | Pay for instance |
| Updates | Rolling updates | Manual |

#### **5. RAG Implementation:**
**Why RAG?**
- LLMs ko naye data nahi pata
- Private documents
- Reduced hallucinations
- Cost-effective (no fine-tuning)

**Technical Stack:**
- **Chunking**: RecursiveCharacterTextSplitter
- **Embeddings**: Google Gemini Embeddings (768 dimensions)
- **Vector DB**: Qdrant (fast similarity search)
- **Retrieval**: Cosine similarity (Top-5)
- **LLM**: Gemini Pro with context

#### **6. LangGraph Benefits:**
- **Orchestration**: Multiple agents ko manage
- **State Management**: Conversation state maintain
- **Conditional Routing**: Dynamic agent selection
- **Error Handling**: Graceful failures

#### **7. Deployment Pipeline:**
```
Code Push → GitHub Actions → Docker Build → ECR Push → ECS Update
```
- **Zero Downtime**: Rolling updates
- **Rollback**: Previous ECR image se
- **Monitoring**: CloudWatch logs

### **Common Interview Questions & Answers:**

**Q1: Why microservices instead of monolith?**
*"Initially monolith design socha tha, but scaling issues dekhe. Agent service computationally heavy hai (LLM calls), while Auth/Chat light hai. Microservices se main agent service ko independently scale kar sakta hoon without affecting others. Plus, agar ek service fail ho, baaki services running rahti hain."*

**Q2: How do you handle authentication across microservices?**
*"JWT token-based authentication use kiya. Gateway pe verify hota hai, phir user ID ko header mein pass karta hoon (`x-user-id`). Services ko token verify nahi karna padta, just header se user ID le lete hain. Isse redundant verification avoid hota hai."*

**Q3: Explain your RAG pipeline in detail.**
*"PDF ko parse karte hain, phir 1000-character chunks mein break karte hain with 200-char overlap. Google Gemini embeddings use karke har chunk ka 768-dimensional vector generate hota hai jo Qdrant mein store hota hai. User query aane pe uska bhi embedding generate karke cosine similarity se top-5 relevant chunks retrieve karte hain. In chunks ko context ke roop mein LLM ko dete hain jo accurate answer generate karta hai."*

**Q4: How do you ensure zero downtime during deployment?**
*"AWS ECS rolling updates use karta hoon. Pehle new task start hota hai with updated image. Health check pass hone ke baad hi traffic milti hai. Tab purana task terminate hota hai. Isse user ko koi downtime nahi dikhta."*

**Q5: What happens if Agent service crashes?**
*"ECS automatically naya task start kar deta hai (desired count maintain karne ke liye). ALB unhealthy target ko traffic nahi bhejta. Plus, Redis mein conversation history hai, so state loss nahi hota. User ko error message milega but data safe rahega."*

**Q6: How do you handle rate limiting?**
*"Agent service mein `checkAgentLimit()` function hai jo user ki credits aur rate limits check karta hai. Redis se track karte hain (sliding window counter). Agar limit exceed ho, error throw hota hai before LLM call, so credits waste nahi hote."*

**Q7: Why Qdrant for vector storage?**
*"Qdrant specialized vector database hai with:
- Fast HNSW (Hierarchical Navigable Small World) indexing
- Low latency similarity search
- REST API (easy integration)
- Self-hosted option (cost saving vs Pinecone)"*

**Q8: Explain your CI/CD pipeline.**
*"GitHub Actions pe setup hai. Main branch pe push hote hi:
1. Code checkout hota hai
2. AWS credentials configure hote hain
3. Har service ka Docker image build hota hai
4. ECR mein push hota hai (versioned with :latest tag)
5. ECS force new deployment trigger hota hai
6. ECS new image pull karke rolling update karta hai
Total time: ~5-7 minutes for complete deployment"*

### **Architecture Decisions & Trade-offs:**

**Decision 1: Microservices vs Monolith**
- ✅ Chosen: Microservices
- Reason: Independent scaling, Agent service heavy hai
- Trade-off: Network latency, complexity increase

**Decision 2: ECS vs Kubernetes**
- ✅ Chosen: ECS
- Reason: AWS-native, simpler, less overhead
- Trade-off: Vendor lock-in, less flexibility

**Decision 3: Qdrant vs Pinecone**
- ✅ Chosen: Qdrant
- Reason: Self-hosted, free, fast
- Trade-off: Infrastructure management

**Decision 4: Redis vs Database for Memory**
- ✅ Chosen: Redis
- Reason: In-memory, fast, simple
- Trade-off: Data persistence (use RDB/AOF)

### **Scalability Considerations:**

**Current Limitations:**
1. **Agent Service**: Synchronous LLM calls (slow for multiple users)
2. **MongoDB**: Single instance
3. **Redis**: Single instance

**Future Improvements:**
1. **Queue System** (SQS/RabbitMQ): Async agent processing
2. **MongoDB Replica Set**: High availability
3. **Redis Cluster**: Distributed caching
4. **CDN** (CloudFront): Frontend static files
5. **ElastiCache**: Managed Redis
6. **RDS**: Managed MongoDB (DocumentDB)

### **Cost Optimization:**

**Current Monthly Cost (Approx):**
- ECS: $20-30 (t3.medium instances)
- ECR: $1-2 (image storage)
- ALB: $18-20
- MongoDB Atlas: $0 (free tier) / $25 (M10)
- Qdrant: $0 (self-hosted)
- API Costs:
  - Google Gemini: $0.50-1 per 1M tokens
  - Tavily Search: $1 per 1000 searches
  
**Total: ~$70-100/month**

### **Monitoring & Debugging:**

**Logging:**
- CloudWatch Logs (ECS tasks)
- Morgan middleware (HTTP requests)
- Console logs

**Monitoring:**
- ECS Service metrics (CPU, Memory)
- ALB metrics (Request count, Latency)
- CloudWatch Alarms

**Debugging:**
```bash
# ECS logs
aws logs tail /ecs/gateway --follow

# Service status
aws ecs describe-services --cluster cortex-ai-cluster --services gateway-service
```

---

## 🎯 Final Tips for Interview:

### **Communication Strategy:**

1. **Start High-Level:**
   - "It's a microservices-based AI chat application..."
   
2. **Go Deep on Request:**
   - "Want me to explain RAG pipeline in detail?"

3. **Use Diagrams:**
   - Draw on whiteboard/paper
   - Visual representation helps

4. **Mention Trade-offs:**
   - Shows maturity
   - "I chose X over Y because..."

5. **Real Numbers:**
   - "1000-character chunks"
   - "768-dimensional vectors"
   - "Top-5 similarity search"

6. **Production Thinking:**
   - "For production, I would add..."
   - Monitoring, scaling, security

### **Practice Questions:**

1. "Walk me through your system architecture"
2. "How does a user request flow through your system?"
3. "Explain your RAG implementation"
4. "How do you deploy new changes?"
5. "What happens if [X service] fails?"
6. "How would you scale this to 1 million users?"
7. "What's your biggest technical challenge?"
8. "How do you ensure data security?"

### **Red Flags to Avoid:**

❌ "I just followed a tutorial"
✅ "I researched different approaches and chose X because..."

❌ "I don't know how it works internally"
✅ "Let me explain the internals..."

❌ "It works on my machine"
✅ "It's deployed on AWS ECS with monitoring"

### **Strengths to Highlight:**

✅ **Full-stack**: Frontend + Backend + DevOps
✅ **Modern Stack**: React, Microservices, Docker, AWS
✅ **AI/ML**: RAG, Embeddings, Vector DB
✅ **Production-ready**: CI/CD, Monitoring, Scalability
✅ **Problem-solving**: Multiple agents for different tasks

---

## 📊 System Design Diagram (ASCII Art)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMPLETE SYSTEM FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

                                   USER
                                     │
                                     │ Browser Request
                                     ▼
                    ┌──────────────────────────────────┐
                    │      FRONTEND (React)            │
                    │  - Redux (State)                 │
                    │  - TailwindCSS                   │
                    │  - Axios (API calls)             │
                    └────────────┬─────────────────────┘
                                 │ HTTPS (POST /api/agent)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                               AWS CLOUD                                  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │               Application Load Balancer (ALB)                  │     │
│  │  - SSL Termination                                             │     │
│  │  - Health Checks                                               │     │
│  │  - Target: Gateway Service (Port 8000)                         │     │
│  └─────────────────────────┬─────────────────────────────────────┘     │
│                            │                                            │
│                            ▼                                            │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                 ECS CLUSTER: cortex-ai-cluster                 │     │
│  │                                                                │     │
│  │  ┌─────────────────────────────────────────────────────┐      │     │
│  │  │      GATEWAY SERVICE (Port 8000)                    │      │     │
│  │  │  Container: gateway:latest                          │      │     │
│  │  │  - Express.js                                       │      │     │
│  │  │  - JWT Verification                                 │      │     │
│  │  │  - Request Routing                                  │      │     │
│  │  └────┬────────────────────────────────────────────────┘      │     │
│  │       │                                                        │     │
│  │       ├──────┬──────────┬──────────┬─────────┐               │     │
│  │       ▼      ▼          ▼          ▼         ▼               │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │     │
│  │  │  AUTH  │ │  CHAT  │ │ AGENT  │ │BILLING │ │ REDIS  │     │     │
│  │  │ :4001  │ │ :4002  │ │ :4003  │ │ :4004  │ │ :6379  │     │     │
│  │  └────────┘ └────────┘ └────┬───┘ └────────┘ └────────┘     │     │
│  │                              │                                │     │
│  │                              ▼                                │     │
│  │                    ┌──────────────────┐                       │     │
│  │                    │   LANGGRAPH      │                       │     │
│  │                    │   ROUTER         │                       │     │
│  │                    └────┬─────────────┘                       │     │
│  │                         │                                     │     │
│  │       ┌─────────────────┼──────────────────┐                 │     │
│  │       ▼                 ▼                  ▼                 │     │
│  │  ┌────────┐       ┌────────┐       ┌────────┐               │     │
│  │  │  CHAT  │       │ SEARCH │       │ CODING │               │     │
│  │  │ AGENT  │       │ AGENT  │       │ AGENT  │               │     │
│  │  └────────┘       └────────┘       └────────┘               │     │
│  │       ▼                 ▼                  ▼                 │     │
│  │  ┌────────┐       ┌────────┐       ┌────────┐               │     │
│  │  │  PDF   │       │  PPT   │       │ VISION │               │     │
│  │  │ AGENT  │       │ AGENT  │       │ AGENT  │               │     │
│  │  └────────┘       └────────┘       └────────┘               │     │
│  │       ▼                                  ▼                   │     │
│  │  ┌────────┐       ┌──────────────────────────┐              │     │
│  │  │PDF RAG │       │   IMAGE ANALYZER         │              │     │
│  │  │ AGENT  │       │   AGENT                  │              │     │
│  │  └────┬───┘       └──────────────────────────┘              │     │
│  │       │                                                      │     │
│  │       ▼                                                      │     │
│  │  ┌─────────────────────────────────────┐                    │     │
│  │  │      RAG PIPELINE                   │                    │     │
│  │  │  1. PDF Parse                       │                    │     │
│  │  │  2. Text Chunking                   │                    │     │
│  │  │  3. Embeddings                      │                    │     │
│  │  │  4. Qdrant Storage                  │                    │     │
│  │  │  5. Similarity Search               │                    │     │
│  │  │  6. Context Building                │                    │     │
│  │  │  7. LLM Query                       │                    │     │
│  │  └─────────────────────────────────────┘                    │     │
│  │                                                              │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    External Services                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│  │  │ MongoDB  │  │  Qdrant  │  │   S3     │  │  Gemini  │     │   │
│  │  │  Atlas   │  │  Vector  │  │ Bucket   │  │   API    │     │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE                                   │
└─────────────────────────────────────────────────────────────────────────┘

    Developer Push
          │
          ▼
    ┌──────────────┐
    │   GitHub     │
    │   Main       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │      GitHub Actions Workflow         │
    │  1. Checkout code                    │
    │  2. Configure AWS                    │
    │  3. Docker build (all services)      │
    │  4. Tag images                       │
    │  5. Push to ECR                      │
    │  6. Force ECS deployment             │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │      AWS ECR (Container Registry)    │
    │  - gateway:latest                    │
    │  - auth-service:latest               │
    │  - chat-service:latest               │
    │  - agent-service:latest              │
    │  - billing-service:latest            │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │      AWS ECS (Container Service)     │
    │  - Pull new images                   │
    │  - Start new tasks                   │
    │  - Health check                      │
    │  - Route traffic                     │
    │  - Stop old tasks                    │
    │  ✅ Zero downtime deployment         │
    └──────────────────────────────────────┘
```

---

## 🏆 Closing Statement for Interview:

*"Overall, iss project se maine multiple technologies integrate karna sikha - React frontend se lekar AWS deployment tak. Main technical highlight RAG implementation hai jisme embeddings aur vector database ka use kiya. Future mein isko aur improve kar sakta hoon - async processing with queues, caching layer add kar ke, aur monitoring dashboards banake. Iss project ne mujhe real-world production systems ke baare mein kaafi practical knowledge di hai."*

---

**Good luck with your interview! 🚀**

Yaad rakhna:
- Confident rehna
- Diagrams banao
- Trade-offs discuss karo
- Production thinking dikhao
- Questions poochna (shows interest)

**All the best! 💪**
