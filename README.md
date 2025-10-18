# seer_vault
A conversational file processing, editing and storage system (ElasticSearch + Fivetran + VertexAI)
- [Introduction](#introduction-to-the-project-aiaccelerate)
    - [Interface Overview](#interface-overview)
    - [An Automated Semantic Retrieval System](#an-automated-semantic-retrieval-system)
    - [Continuous Semantic Extraction Pipeline](#continuous-semantic-extraction-pipeline)
    - [Enterprise Data Integration Through Fivetran](#enterprise-data-integration-through-fivetran)

- [Project Goals](#project-goals)
    - [1. Intelligent Conversational File Access](#1-intelligent-conversational-file-access)
    - [2. Superior Semantic Search Performance](#2-superior-semantic-search-performance)
    - [3. Real-Time Semantic Processing](#3-real-time-semantic-processing)
    - [4. Production-Scale Architecture](#4-production-scale-architecture)
    - [5. Extensible Data Integration](#5-extensible-data-integration)

## Introduction to the Project (AI:Accelerate)

### Interface Overview
**SeerVault** provides a production-grade conversational interface that fundamentally transforms how users interact with cloud storage. Rather than forcing users to navigate folder hierarchies or remember specific filenames, the system should understand and respond to natural language commands with the same fluency as a human assistant. Users should be able to issue complex requests such as *"find all financial documents from Q3 that mention revenue projections"* or *"create a timeline visualization from my travel photos taken in Europe last summer"* and receive accurate, contextually relevant results. The system maintains conversational context across multiple interactions, allowing users to refine queries through follow-up questions without repeating information. This requirement extends beyond simple search to encompass full CRUD operations, enabling users to organize, rename, share, and modify files through natural dialogue. The interface must handle ambiguous queries gracefully, asking clarifying questions when intent is unclear while avoiding unnecessary interaction friction. 

### An Automated Semantic Retrieval System
The platform implements a sophisticated multi-layered automatic retrieval system that outperforms traditional filename-based search across diverse content types. Dense vector embeddings generated through Vertex AI capture semantic meaning, enabling the system to match queries with conceptually related documents even when they share no common keywords. Sparse BM25 indices provide precise matching for specific terms, acronyms, and technical vocabulary where exact correspondence matters. Graph-based contextual links track relationships between files including citations, version histories, co-authorship patterns, and temporal proximity, allowing the system to surface documents that exist in related contexts. Multi-modal fusion capabilities would enable unified search across text documents, images, and videos, understanding that a user searching for "product launch materials" may need slides, photographs, and recorded presentations. The retrieval system must be able to fetch results while maintaining low latency even when operating on collections exceeding one million files. This requirement ensures that users can trust the system to surface truly relevant content without manually sifting through irrelevant results, making semantic search a reliable foundation for knowledge work.

### Continuous Semantic Extraction Pipeline
**SeerVault** requires a robust, scalable content processing infrastructure that automatically extracts rich semantic profiles and features from every uploaded file with minimal latency. The system handles diverse file formats including PDFs, Microsoft Office Documents, Spreadsheets, images, and source code, preocessing each through specialized extraction pipeline tailored to their content type. *As an example*: PDF processing should identify document structure, extract named entities, recognize topics and themes, and preserve citation relationships.  Image processing should generate visual embeddings, perform object detection, extract text through OCR, and capture EXIF metadata including location and timestamp information. The extraction pipeline would sustain throughput of at least 500 files per second with end-to-end indexing latency under five minutes, ensuring that newly uploaded content becomes searchable almost immediately. All extracted metadata must be stored in **Elastic Cloud** with appropriate indexing strategies that balance query performance against storage efficiency. This continuous processing transforms passive file storage into an active knowledge substrate where every piece of content becomes deeply understood and interconnected.  

### Enterprise Data Integration Through Fivetran
The platform demonstrates extensibility beyond user-uploaded files by implementing automated data pipeline integration that brings external data sources into the semantic storage ecosystem. Using the **Fivetran** Connector SDK, the system builds at least one production-ready custom connector that extracts data from a business application, public API, or specialized data source, transforming it into structured formats suitable for storage in Google BigQuery. The connector must handle incremental updates efficiently, detecting and syncing only changed records rather than performing full data refreshes. The **Fivetran**-integrated data is treated as first-class content within SeerVault, appearing seamlessly in search results alongside user-uploaded files and participating in cross-source analytics and visualizations. This integration demonstrates a concrete business value, such as connecting a CRM system to enable queries like *"show me all sales documents related to customers who signed contracts in the last quarter"* where customer data flows through **Fivetran** while documents come from user uploads. The implementation showcases how **SeerVault** can evolve from personal file storage into a comprehensive data hub that unifies disparate information sources under a single conversational interface, eliminating data silos and enabling insights that span traditional organizational boundaries.

## Project Goals
### 1. Intelligent Conversational File Access
Enable users to interact with their files through natural language instead of manual navigation. Users should be able to request *"find my Paris vacation photos from 2017"* or *"summarize all contracts mentioning liability"* and receive accurate results based on semantic understanding, not just filenames.

### 2. Superior Semantic Search Performance
Achieve high precision through **hybrid** retrieval combining dense vector embeddings, BM25 keyword matching, and graph-based contextual links. Outperform traditional filename search by understanding content meaning across text, images, and documents.

### 3. Real-Time Semantic Processing
Process uploaded files at M files/sec with <2 minute indexing latency. Automatically extract structured metadata, entities, embeddings, and relationships from PDFs, spreadsheets, images, etc. to build a queryable knowledge graph.

### 4. Production-Scale Architecture
Deploy a serverless system on Google Cloud supporting **N** concurrent users with low query latency. Implementing an enterprise security (SSO, GDPR/HIPAA compliance), comprehensive observability, and Infrastructure-as-Code for reproducible deployments.

### 5. Extensible Data Integration
Demonstrate **Fivetran** SDK integration by building a custom connector that automatically ingests external data sources into BigQuery, enabling unified semantic search across both user-uploaded files and business system data.

## Core Components
### **Frontend:** React + TypeScript Chat UI (conversational input + optional file browser + visualizations)
### **Object Storage:** Google Cloud Storage (durable file books, versioning, signed URLs)
### **Event backbone:** Pub/Sub topics for file.uploaded, extraction.requested, index.updated, query.submitted
### **Extraction workers:** Cloud Run Jobs (stateless)
### **Embedding Service:** Vertex AI Embeddings 
### **Reasoning LLM:** Vertex/Gemini for query decomposition, multi-turn reasoning and summarization
### **Analytics & Warehouse:** BigQuery (via Fivetran for external data sync) + dbt transformations
### **Cache/Context:** Memorystore (Redis) for conversational context and hot-embedding caching
### **Orchestration:** Cloud Run for LLM Pipelines + Cloud Tasks for scheduled jobs
### **Observability:** OpenTelemetry -> Cloud Trace -> Elastic APM, Cloud Monitoring + Logging
### **IaC/CI:** Terraform + Github Actions (CI pipeline)


---

## 🗂️ Development Phases

### **Phase 0 — Setup & Skeleton (1 week)**
- Initialize repo, Terraform modules (GCS, Pub/Sub, IAM)
- Build minimal React UI (chat + file upload)
- Create Cloud Function to emit `file.uploaded` events  
**Goal:** Working foundation + deployable infrastructure

---

### **Phase 1 — Core Semantic System (4–6 weeks)**
- Build **file extraction pipeline** (PDF, DOCX, image OCR)
- Generate **embeddings via Vertex AI** and index in ElasticSearch  
- Implement **hybrid retrieval** (vector + BM25)
- Basic **chat interface** to query, summarize, and preview results  
**Goal:** Upload → Extract → Search end-to-end

---

### **Phase 2 — Intelligent Agents & Data Integration (8–10 weeks)**
- Add **Gemini reasoning agent** for multi-turn conversations  
- Integrate **Fivetran connector** to sync external data into **BigQuery**
- Map structured BigQuery data into ElasticSearch for unified search
- Add **data visualization and summarization** features  
**Goal:** Cross-source intelligent retrieval (files + enterprise data)

---

### **Phase 3 — Scalability & Enterprise Features (10–12 weeks)**
- Optimize indexing (ILM, hot/cold tiers, caching)
- Add **SSO, audit logs, and field-level security**
- Implement **observability** (Elastic APM, Cloud Monitoring)
- Compliance (GDPR, HIPAA-ready design)
**Goal:** Production-grade system with monitoring and security

---

## 🧠 Data Flow

1. User uploads file → stored in **GCS**
2. Pub/Sub triggers extraction → parse + chunk content
3. Generate **embeddings (Vertex)** + index in **ElasticSearch**
4. Graph links connect files, metadata, and related entities
5. User queries → **hybrid retrieval** (vector + keyword + graph)
6. **Gemini agent** summarizes or visualizes results

---

## 🧱 Core Index Mapping (Simplified)
| Field | Type | Purpose |
|-------|------|----------|
| file_id | keyword | File identifier |
| text_bm25 | text | Keyword search |
| text_vector | dense_vector (768D) | Semantic similarity |
| metadata | object | Author, date, tags |
| permissions | keyword | Access control |

---

## 🧰 Tools & Infrastructure

| Component | Technology |
|------------|-------------|
| Storage | Google Cloud Storage (GCS) |
| Compute | Cloud Run (serverless) |
| Indexing | Elastic Cloud |
| Embeddings | Vertex AI (textembedding-gecko / multimodalembedding) |
| Data Integration | Fivetran + BigQuery |
| Orchestration | Pub/Sub + Cloud Tasks |
| Infrastructure | Terraform + GitHub Actions |
| Observability | Elastic APM + Cloud Monitoring |
| Frontend | React + TypeScript |

---

## ✅ Phase Roadmap Summary

| Phase | Focus | Output |
|--------|--------|--------|
| 0 | Setup & Infra | Terraform, GCS, Pub/Sub, UI Skeleton |
| 1 | Semantic Core | Upload → Extract → Index → Search |
| 2 | Reasoning & Integration | Gemini Agents, Fivetran Connector |
| 3 | Scale & Security | SSO, Observability, ILM, Compliance |

---

## 📈 Next Steps
- [ ] Implement Terraform setup for GCS + Pub/Sub  
- [ ] Build PDF extraction service (Cloud Run)  
- [ ] Create Elastic index mapping + hybrid search API  
- [ ] Integrate Vertex Embeddings + Gemini Reasoning  
- [ ] Add Fivetran Connector → BigQuery Pipeline  

---

**Author:** Rajpreet Singh  
**Project:** AI:Accelerate — SeerVault  
**Goal:** Transform file storage into an AI-powered conversational knowledge system.

