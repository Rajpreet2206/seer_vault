import os
import asyncio
import logging
import threading
import queue
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from google.adk.sessions import InMemorySessionService
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.models import Gemini
from google.adk.tools import FunctionTool
from google import genai

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize SQLAlchemy (will be configured in create_app)
from app.models import db

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # File uploads
    app.config["UPLOAD_FOLDER"] = os.path.join(app.instance_path, "uploads")
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ===== DATABASE CONFIGURATION =====
    # Try to get DATABASE_URL first (new format)
    database_url = os.getenv("DATABASE_URL")
    
    # If not available, build it from individual parameters (backward compatibility)
    if not database_url:
        db_driver = os.getenv("DB_DRIVER", "postgresql+pg8000")
        db_username = os.getenv("DB_USERNAME", "postgres")
        db_password = os.getenv("DB_PASSWORD", "password")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "your_db_name")
        
        database_url = f"{db_driver}://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}"
        logger.info("Built DATABASE_URL from individual DB parameters")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize SQLAlchemy with app
    db.init_app(app)
    logger.info(f"Database configured: {database_url.split('@')[0]}...")
    
    # Create tables
    with app.app_context():
        db.create_all()
        logger.info("Database tables created/verified")

    # ===== GEMINI/LLM CONFIGURATION =====
    
    # Tools for the agent
    def add_numbers(a: int, b: int) -> int: return a + b
    def multiply_numbers(a: int, b: int) -> int: return a * b
    def get_greeting(name: str) -> str: return f"Hello, {name}! Welcome to the ADK Agent."
    tools = [FunctionTool(f) for f in [add_numbers, multiply_numbers, get_greeting]]

    # Store tools and agent config in app for reuse
    app.config['TOOLS'] = tools
    app.config['AGENT_CONFIG'] = {
        'name': 'calculator_assistant',
        'instruction': 'You are a helpful assistant. Use the available tools to help the user.',
        'description': 'Math + greeting agent'
    }
    
    # Store API key and model info
    app.config['GEMINI_API_KEY'] = os.getenv("GEMINI_API_KEY")
    app.config['MODEL_NAME'] = "gemini-2.5-flash"
    
    if not app.config['GEMINI_API_KEY']:
        logger.warning("GEMINI_API_KEY not set in environment variables!")
    
    # Global session service (shared across all runner instances)
    session_service = InMemorySessionService()
    
    # Initialize session
    async def init_session():
        await session_service.create_session(
            app_name="seer_app",
            user_id="user",
            session_id="main_session"
        )
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(init_session())
        logger.info("Session initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize session: {e}")
        raise
    finally:
        loop.close()
    
    app.config['SESSION_SERVICE'] = session_service

    # Import and register blueprint AFTER all config is set
    from .routes import main
    app.register_blueprint(main)

    return app