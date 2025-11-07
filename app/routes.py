import os
from flask import Flask, Blueprint, jsonify, render_template, request, current_app
from werkzeug.utils import secure_filename
from .services.processing import process_file
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

@main.route("/api/upload", methods=["POST"])
def upload():
    upload_folder = current_app.config["UPLOAD_FOLDER"]

    if "file" not in request.files:
        return jsonify({"success": False, "error": "no file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "no filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "bad extension"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(upload_folder, filename)
    file.save(path)

    result = process_file(path)

    return jsonify({"success": True, "filename": filename, "result": result})

@main.post("/api/search")
def search():
    try:
        data = request.get_json()
        query = data.get("query", "")
        
        if not query:
            logger.warning("Empty query received")
            return jsonify({"results": ["No query provided"]}), 400

        logger.info(f"Search endpoint received query: {query}")
        
        # Create a fresh Agent and Runner for this request
        try:
            # Get config from app
            tools = current_app.config['TOOLS']
            agent_config = current_app.config['AGENT_CONFIG']
            api_key = current_app.config['GEMINI_API_KEY']
            model_name = current_app.config['MODEL_NAME']
            session_service = current_app.config['SESSION_SERVICE']
            
            # Create fresh client and model
            client = genai.Client(api_key=api_key)
            model = Gemini(model=model_name, client=client)
            
            # Create fresh agent
            agent = Agent(
                name=agent_config['name'],
                model=model,
                instruction=agent_config['instruction'],
                description=agent_config['description'],
                tools=tools
            )
            
            # Create fresh runner
            runner = Runner(agent=agent, app_name="seer_app", session_service=session_service)
            
            # Execute the query
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