# SeerVault - Semantic AI-Powered File Discovery

## System Architecture Overview

SeerVault is a **conversational file search system** that combines semantic search with AI reasoning to help users find and interact with their files using natural language. The system operates in three main layers: (1) **Frontend Layer** - a React TypeScript UI with glassmorphic design that captures user queries and file uploads through a chat interface; (2) **Backend Processing Layer** - FastAPI server that coordinates file uploads, content extraction, and query decomposition; (3) **Search & Storage Layer** - Elasticsearch indexes file content as both keyword-searchable text (BM25) and dense vector embeddings (semantic meaning), allowing hybrid search that understands both exact matches and conceptual similarities.

The workflow follows a **file ingestion to intelligent retrieval pipeline**: When a user uploads a file, the backend saves it to disk, extracts structured metadata (text content, file type, size), generates semantic embeddings using a local transformer model (sentence-transformers), and indexes everything in Elasticsearch. When a user queries with natural language (e.g., "find my financial documents"), the system decomposes the query intent using pattern matching, generates an embedding for the query, performs hybrid search combining BM25 keyword matching with semantic vector similarity, ranks results by relevance score, and returns the top match with a preview of the file content. The AI reasoning agent generates contextually appropriate responses that guide users to their files naturally.

## Key Components

- **Frontend (React + TypeScript)**: Chat interface with file explorer panel, message display, search input, file upload, and preview modal.

- **Backend (FastAPI)**: REST API handling three main operations:
  - `POST /upload` - Receives files, extracts content, generates embeddings, indexes in Elasticsearch
  - `POST /search` - Decomposes user query, performs hybrid search, generates AI response
  - `GET /file/{file_id}/preview` - Returns cleaned text preview of file content

- **Extraction Service**: Parses PDF, DOCX, and TXT files using PyPDF2 and python-docx. Cleans extracted text by removing special characters and excessive whitespace. Limits preview to first 1000 characters for performance.

- **Embedding Service**: Uses sentence-transformers (`all-MiniLM-L6-v2` model) to generate 384-dimensional dense vector embeddings for semantic similarity. Local model runs on CPU without requiring cloud APIs or billing.

- **Search Service**: Elasticsearch with hybrid retrieval:
  - **BM25 Index**: Keyword-based search on filename, content, and entities
  - **Vector Index**: Semantic similarity search using cosine distance on 384-dim embeddings
  - **Ranking**: Combines both signals to return most relevant results

- **AI Reasoning Service**: Decomposes queries to detect intent (search, recent, filter by type), generates natural language responses based on search results, and provides context-aware guidance.

- **Storage**: Local file system for uploaded documents, Elasticsearch for indexed metadata and embeddings, in-memory state for chat messages.

## Data Flow Diagram
```
User Input
    ↓
[Frontend - Chat UI]
    ├─→ Upload File
    │     ↓
    │   [Backend - Upload Handler]
    │     ├─→ Save to Disk
    │     ├─→ Extract Text (PDF/DOCX/TXT)
    │     ├─→ Generate Embedding (sentence-transformers)
    │     └─→ Index in Elasticsearch
    │
    └─→ Search Query
          ↓
        [Backend - Search Handler]
          ├─→ Decompose Query Intent
          ├─→ Generate Query Embedding
          ├─→ Hybrid Search (BM25 + Vector)
          ├─→ AI Response Generation
          └─→ Return Result
               ↓
             [Frontend - Display Result + Preview]
               ├─→ Show File Metadata
               ├─→ Show Relevance Score
               └─→ Preview Modal (on click)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Tailwind CSS | User interface and chat |
| **Backend** | FastAPI, Uvicorn | API server and request handling |
| **Search** | Elasticsearch 8.11 | Full-text and semantic search |
| **Embeddings** | sentence-transformers | Local semantic embeddings |
| **File Parsing** | PyPDF2, python-docx | Content extraction |
| **Storage** | Local filesystem | File storage |

## API Endpoints

### Upload File
```
POST /upload
- Request: multipart/form-data (file)
- Response: { file_id, filename, status }
```

### Search Files
```
POST /search?query={search_term}
- Request: query string
- Response: { found, result, response, analysis }
```

### Get File Preview
```
GET /file/{file_id}/preview?lines=15
- Request: file_id in URL
- Response: { filename, preview, has_more }
```

### Health Check
```
GET /health
- Response: { status, elasticsearch_health }
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker (for Elasticsearch)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Elasticsearch
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Start FastAPI
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Future Enhancements

- **Fivetran Integration**: Connect external data sources (CRM, databases) for unified search
- **BigQuery Integration**: Store and analyze search patterns
- **Gemini AI Integration**: Replace pattern-based query decomposition with actual LLM reasoning
- **Cloud Deployment**: Deploy on Google Cloud with Cloud Run, Cloud Storage, and Pub/Sub
- **Advanced Features**: File sharing, collaborative search, audit logs, GDPR compliance
