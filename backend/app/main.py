from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path

from services.elasticsearch_service import create_index, index_document, hybrid_search, health_check
from services.extraction_service import extract_metadata

app = FastAPI(title="SeerVault API", version="0.1.0")

# CORS middleware - MORE PERMISSIVE FOR DEVELOPMENT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now (development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Directories
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ES_INDEX = "seervault-files"

@app.on_event("startup")
async def startup():
    """Initialize Elasticsearch index on startup"""
    await create_index(ES_INDEX)

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
    """Upload and extract file"""
    try:
        # Save file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract metadata and content
        metadata = await extract_metadata(file.filename, str(file_path))
        metadata["file_id"] = file_id
        
        # Index in Elasticsearch
        await index_document(ES_INDEX, file_id, metadata)
        
        return {
            "status": "success",
            "file_id": file_id,
            "filename": file.filename,
            "message": "File uploaded and indexed successfully"
        }
    except Exception as e:
        print(f"Upload error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/search")
async def search_files(query: str):
    """Search files with AI reasoning"""
    from services.gemini_service import decompose_query, generate_response
    
    try:
        # Analyze query with AI
        analysis = await decompose_query(query)
        
        # Perform search
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
                },
                "response": response_text,
            }
        else:
            return {
                "query": query,
                "found": False,
                "analysis": analysis,
                "result": None,
                "response": f"No files found matching '{query}'. Try different keywords."
            }
    except Exception as e:
        print(f"Search error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/file/{file_id}/preview")
async def get_file_preview(file_id: str, lines: int = 15):
    """Get preview of file content"""
    try:
        # Search for file
        results = await hybrid_search(ES_INDEX, file_id, top_k=1)
        
        if results:
            file_data = results[0]
            content = file_data.get("content", "")
            
            # Limit content
            preview_text = content[:500] if content else "No content available"
            
            return {
                "file_id": file_id,
                "filename": file_data.get("filename"),
                "preview": preview_text,
                "has_more": len(content) > 500
            }
        else:
            return {"error": "File not found"}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
