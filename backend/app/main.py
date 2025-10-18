from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import asyncio
from pathlib import Path

from fivetran_connector.connector import SeerVaultCRMConnector
from fivetran_connector.config import CONNECTOR_CONFIG
from services.elasticsearch_service import create_index, index_document, hybrid_search, health_check
from services.extraction_service import extract_metadata
from services.async_ai_service import extract_ai_features
from services.task_queue import task_queue

app = FastAPI(title="SeerVault API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Directories
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ES_INDEX = "seervault-files"
ai_processing = {}

async def process_file_in_background(file_id: str, filename: str, file_path: str):
    """Process file with AI in background"""
    try:
        ai_processing[file_id]["status"] = "extracting_content"
        
        # Extract content
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        ai_processing[file_id]["status"] = "analyzing_with_ai"
        
        # Extract AI features with Gemini
        ai_features = await extract_ai_features(filename, content)
        
        ai_processing[file_id]["status"] = "extracting_metadata"
        
        # Get metadata
        metadata = await extract_metadata(filename, file_path)
        metadata["file_id"] = file_id
        metadata.update(ai_features)
        metadata["ai_processed"] = True
        
        ai_processing[file_id]["status"] = "indexing"
        
        # Index in Elasticsearch
        await index_document(ES_INDEX, file_id, metadata)
        
        ai_processing[file_id] = {
            "status": "completed",
            "file_id": file_id,
            "filename": filename,
            "summary": ai_features.get("summary", ""),
            "topics": ai_features.get("topics", ""),
        }
        print(f"✓ Background processing completed for {file_id}")
        
    except Exception as e:
        print(f"✗ Background processing error for {file_id}: {e}")
        ai_processing[file_id] = {
            "status": "failed",
            "error": str(e),
            "file_id": file_id,
            "filename": filename
        }

@app.on_event("startup")
async def startup():
    """Initialize Elasticsearch and start background task processor"""
    await create_index(ES_INDEX)
    print("Elasticsearch index initialized")
    
    # Start task queue processor
    asyncio.create_task(task_queue.process_queue())
    print("Background task queue started")

@app.on_event("shutdown")
async def shutdown():
    """Stop background processing"""
    task_queue.stop()
    print("Background task queue stopped")

@app.get("/health")
async def health():
    es_healthy = await health_check()
    return {
        "status": "ok" if es_healthy else "degraded",
        "service": "seervault-api",
        "elasticsearch": "healthy" if es_healthy else "unhealthy",
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file and queue for background AI processing"""
    try:
        # Save file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Initialize processing status
        ai_processing[file_id] = {
            "status": "queued",
            "file_id": file_id,
            "filename": file.filename,
        }
        
        # Queue for background processing
        await task_queue.add_task(
            process_file_in_background,
            file_id,
            file.filename,
            str(file_path)
        )
        
        return {
            "status": "accepted",
            "file_id": file_id,
            "filename": file.filename,
            "processing": True,
            "message": "File uploaded. AI processing started in background."
        }
    except Exception as e:
        print(f"Upload error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/upload/status/{file_id}")
async def get_upload_status(file_id: str):
    """Check AI processing status for uploaded file"""
    status = ai_processing.get(file_id, {"status": "unknown", "file_id": file_id})
    return status

@app.post("/search")
async def search_files(query: str):
    """Search files with hybrid retrieval (BM25 + semantic)"""
    from services.gemini_service import decompose_query, generate_response
    
    try:
        # Analyze query with AI
        analysis = await decompose_query(query)
        
        # Perform hybrid search
        results = await hybrid_search(ES_INDEX, query, top_k=5)
        
        # Generate smart response
        if results:
            top_result = results[0]
            response_text = await generate_response(query, results)
            
            return {
                "query": query,
                "found": True,
                "analysis": analysis,
                "result": {
                    "file_id": top_result.get("file_id"),
                    "filename": top_result.get("filename"),
                    "file_type": top_result.get("file_type"),
                    "size": top_result.get("size"),
                    "relevance_score": round(top_result.get("score", 0), 2),
                    "summary": top_result.get("summary", ""),
                    "topics": top_result.get("topics", ""),
                },
                "response": response_text,
            }
        else:
            return {
                "query": query,
                "found": False,
                "analysis": analysis,
                "result": None,
                "response": f"No files found matching '{query}'."
            }
    except Exception as e:
        print(f"Search error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/file/{file_id}/preview")
async def get_file_preview(file_id: str, lines: int = 15):
    """Get preview of file content"""
    try:
        results = await hybrid_search(ES_INDEX, file_id, top_k=1)
        
        if results:
            file_data = results[0]
            content = file_data.get("content", "")
            preview_text = content[:500] if content else "No content available"
            
            return {
                "file_id": file_id,
                "filename": file_data.get("filename"),
                "preview": preview_text,
                "summary": file_data.get("summary", ""),
                "has_more": len(content) > 500
            }
        else:
            return {"error": "File not found"}
    except Exception as e:
        return {"error": str(e)}

# Fivetran Connector endpoints

@app.post("/connector/sync")
async def sync_crm_data():
    """Trigger Fivetran connector sync"""
    try:
        connector = SeerVaultCRMConnector(CONNECTOR_CONFIG)
        result = connector.sync_data()
        return result
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/connector/status")
async def get_connector_status():
    """Get connector sync status"""
    try:
        connector = SeerVaultCRMConnector(CONNECTOR_CONFIG)
        status = connector.get_sync_status()
        return status
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/connector/search")
async def search_crm_data(query: str):
    """Search CRM data synced via Fivetran"""
    try:
        results = await hybrid_search("seervault-crm-data", query, top_k=5)
        return {
            "query": query,
            "source": "crm",
            "count": len(results),
            "results": results
        }
    except Exception as e:
        print(f"CRM search error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)