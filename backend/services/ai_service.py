import os
from dotenv import load_dotenv
from typing import Dict, Any
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

async def analyze_file_content(filename: str, content: str) -> Dict[str, Any]:
    """Extract basic analysis from file content"""
    try:
        # Simple text analysis without Gemini
        summary = content[:300]
        words = content.split()[:20]
        topics = ", ".join(words)
        
        return {
            "summary": summary,
            "topics": topics,
            "entities": ""
        }
    except Exception as e:
        print(f"Analysis error: {e}")
        return {
            "summary": content[:200],
            "topics": "document",
            "entities": ""
        }

async def generate_embedding(text: str) -> list:
    """Generate embedding for text using sentence-transformers"""
    try:
        embedding = embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 384

async def extract_ai_features(filename: str, content: str) -> Dict[str, Any]:
    """Extract AI-powered features from file"""
    
    # Get basic analysis
    analysis = await analyze_file_content(filename, content)
    
    # Generate embeddings
    summary_embedding = await generate_embedding(analysis["summary"])
    content_embedding = await generate_embedding(content[:500])
    
    print(f"AI features extracted for {filename}")
    print(f"Summary: {analysis['summary'][:100]}...")
    print(f"Topics: {analysis['topics']}")
    
    return {
        "summary": analysis["summary"],
        "topics": analysis["topics"],
        "entities": analysis["entities"],
        "summary_embedding": summary_embedding,
        "content_embedding": content_embedding,
    }
