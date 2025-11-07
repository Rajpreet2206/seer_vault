import os
import json
from flask import Flask, Blueprint, jsonify, render_template, request, current_app
from werkzeug.utils import secure_filename
from .services.processing import process_file
from .services.file_processor import FileProcessor
from .models import db, UploadedFile
import logging
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.models import Gemini
from google import genai

# Set up logging
logger = logging.getLogger(__name__)

main = Blueprint("main", __name__)

ALLOWED_EXT = {"png","jpg","jpeg","gif","pdf","txt","mp4","mp3","zip"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/api/health")
def health():
    return jsonify({"status": "ok"})

# ===== ENHANCED UPLOAD ENDPOINT =====
@main.route("/api/upload", methods=["POST"])
def upload():
    """Upload file, extract info, generate embeddings, store in DB"""
    try:
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        
        # ===== STEP 1: Validate File =====
        if "file" not in request.files:
            return jsonify({"success": False, "error": "no file part"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"success": False, "error": "no filename"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "bad extension"}), 400
        
        # ===== STEP 2: Save File =====
        filename = secure_filename(file.filename)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        file_size = os.path.getsize(filepath)
        
        logger.info(f"File saved: {filename} ({file_size} bytes)")
        
        # ===== STEP 3: Process File (Extract info + Embeddings) =====
        processor = FileProcessor(current_app.config['GEMINI_API_KEY'])
        process_result = processor.process_file(filepath, filename)
        
        if not process_result:
            return jsonify({
                "success": False,
                "error": "Failed to process file"
            }), 500
        
        logger.info("File processing completed successfully")
        
        # ===== STEP 4: Create or Update Database Record =====
        try:
            # Check if file already exists
            existing_file = UploadedFile.query.filter_by(file_name=filename).first()
            
            if existing_file:
                logger.info(f"File already exists with ID {existing_file.id}. Updating...")
                # Update existing record
                db_file = existing_file
                db_file.file_summary = process_result['file_summary']
                db_file.file_content = process_result['file_content']
                db_file.file_metadata = {
                    "file_type": process_result['file_type'],
                    "file_size": process_result['file_size'],
                    "embedding": process_result['embedding'],
                    "extracted_info": process_result['extracted_info'],
                    "processing_status": "completed"
                }
            else:
                logger.info("Creating new file record")
                # Create new record
                db_file = UploadedFile(
                    file_name=filename,
                    file_summary=process_result['file_summary'],
                    file_content=process_result['file_content'],
                    file_metadata={
                        "file_type": process_result['file_type'],
                        "file_size": process_result['file_size'],
                        "embedding": process_result['embedding'],
                        "extracted_info": process_result['extracted_info'],
                        "processing_status": "completed"
                    }
                )
                db.session.add(db_file)
            
            db.session.commit()
            
            logger.info(f"Database record {'updated' if existing_file else 'created'} with ID: {db_file.id}")
            
            return jsonify({
                "success": True,
                "file_id": db_file.id,
                "file_name": filename,
                "file_size": file_size,
                "file_summary": process_result['file_summary'],
                "extracted_info": process_result['extracted_info'],
                "message": "File processed and stored successfully"
            }), 201
            
        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error: {db_error}")
            return jsonify({
                "success": False,
                "error": f"Database error: {str(db_error)}"
            }), 500
        
    except Exception as e:
        logger.error(f"Error in upload endpoint: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== HELPER ENDPOINTS =====

@main.route("/api/files", methods=["GET"])
def list_files():
    """List all uploaded files"""
    try:
        files = UploadedFile.query.all()
        return jsonify({
            "total": len(files),
            "files": [{
                "id": f.id,
                "file_name": f.file_name,
                "file_summary": f.file_summary,
                "created_at": f.created_at.isoformat(),
                "file_metadata": f.file_metadata
            } for f in files]
        }), 200
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return jsonify({"error": str(e)}), 500

@main.route("/api/files/<int:file_id>", methods=["GET"])
def get_file(file_id):
    """Get specific file details"""
    try:
        db_file = UploadedFile.query.get(file_id)
        if not db_file:
            return jsonify({"error": "File not found"}), 404
        
        return jsonify({
            "id": db_file.id,
            "file_name": db_file.file_name,
            "file_summary": db_file.file_summary,
            "file_content": db_file.file_content[:1000],  # First 1000 chars
            "created_at": db_file.created_at.isoformat(),
            "updated_at": db_file.updated_at.isoformat(),
            "file_metadata": db_file.file_metadata,
            "extracted_info": db_file.file_metadata.get('extracted_info') if db_file.file_metadata else None
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving file: {e}")
        return jsonify({"error": str(e)}), 500

@main.route("/api/files/<int:file_id>", methods=["DELETE"])
def delete_file(file_id):
    """Delete a file record"""
    try:
        db_file = UploadedFile.query.get(file_id)
        if not db_file:
            return jsonify({"error": "File not found"}), 404
        
        db.session.delete(db_file)
        db.session.commit()
        logger.info(f"File {file_id} deleted")
        
        return jsonify({"success": True, "message": "File deleted"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting file: {e}")
        return jsonify({"error": str(e)}), 500

# ===== SEARCH ENDPOINT (from before) =====

@main.post("/api/search")
def search():
    """Search using the agent"""
    try:
        data = request.get_json()
        query = data.get("query", "")
        
        if not query:
            logger.warning("Empty query received")
            return jsonify({"results": ["No query provided"]}), 400

        logger.info(f"Search endpoint received query: {query}")
        
        # Create a fresh Agent and Runner for this request
        try:
            tools = current_app.config['TOOLS']
            agent_config = current_app.config['AGENT_CONFIG']
            api_key = current_app.config['GEMINI_API_KEY']
            model_name = current_app.config['MODEL_NAME']
            session_service = current_app.config['SESSION_SERVICE']
            
            client = genai.Client(api_key=api_key)
            model = Gemini(model=model_name, client=client)
            
            agent = Agent(
                name=agent_config['name'],
                model=model,
                instruction=agent_config['instruction'],
                description=agent_config['description'],
                tools=tools
            )
            
            runner = Runner(agent=agent, app_name="seer_app", session_service=session_service)
            
            logger.info("Created fresh runner and executing query...")
            from google.genai import types
            
            content = types.Content(role="user", parts=[types.Part(text=query)])
            events = runner.run(
                user_id="user",
                session_id="main_session",
                new_message=content
            )
            
            response_text = None
            for event in events:
                if event.is_final_response():
                    response_text = event.content.parts[0].text
                    logger.info(f"Got final response: {response_text[:100]}")
                    break
            
            if not response_text:
                logger.warning("No final response found in events")
                response_text = "No response generated"
            
            logger.info(f"Query succeeded: {response_text[:100]}")
            return jsonify({"results": [response_text]})
            
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"Query execution failed: {error_msg}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify({"results": [f"Error: {error_msg}"]}), 500
        
    except Exception as e:
        logger.error(f"Error in search endpoint: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"results": [f"Server error: {str(e)}"]}), 500