import os
import json
import asyncio
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini with correct model
api_key = os.getenv("GEMINI_API_KEY")
GEMINI_AVAILABLE = False
model = None

if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        # Use gemini-pro (most stable free model)
        model = genai.GenerativeModel('gemini-2.5-flash')
        GEMINI_AVAILABLE = True
        print("✓ Gemini API initialized successfully")
    except Exception as e:
        print(f"✗ Gemini initialization failed: {e}")
        GEMINI_AVAILABLE = False
else:
    print("✗ GEMINI_API_KEY not set in .env")

from sentence_transformers import SentenceTransformer
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

async def analyze_with_gemini(filename: str, content: str) -> Dict[str, Any]:
    """Use Gemini to analyze file content"""
    if not GEMINI_AVAILABLE or model is None:
        print("⚠ Gemini not available, using fallback")
        return await fallback_analysis(filename, content)
    
    try:
        # Shorter, simpler prompt for better reliability
        prompt = f"""Analyze this document briefly in JSON format only:

{content[:1500]}

Return ONLY valid JSON, no other text:
{{"summary": "1-2 sentence summary", "topics": "comma-separated topics", "entities": "key people/companies/dates"}}"""
        
        response = model.generate_content(prompt, request_options={"timeout": 30})
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Handle markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        analysis = json.loads(response_text)
        print(f"✓ Gemini analysis successful for {filename}")
        return analysis
            
    except json.JSONDecodeError as e:
        print(f"⚠ JSON parsing failed: {e}, using fallback")
        return await fallback_analysis(filename, content)
    except Exception as e:
        print(f"⚠ Gemini error: {e}, using fallback")
        return await fallback_analysis(filename, content)

async def fallback_analysis(filename: str, content: str) -> Dict[str, Any]:
    """Fallback analysis without Gemini"""
    summary = content[:250]
    words = content.split()[:12]
    topics = ", ".join(words)
    
    return {
        "summary": summary,
        "topics": topics,
        "entities": "",
        "document_type": "document"
    }

async def generate_embedding(text: str) -> list:
    """Generate embedding for text"""
    try:
        embedding = embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 384

async def extract_ai_features(filename: str, content: str) -> Dict[str, Any]:
    """Extract AI features from file"""
    
    analysis = await analyze_with_gemini(filename, content)
    
    # Generate embeddings
    summary_embedding = await generate_embedding(analysis["summary"])
    content_embedding = await generate_embedding(content[:500])
    
    return {
        "summary": analysis["summary"],
        "topics": analysis.get("topics", ""),
        "entities": analysis.get("entities", ""),
        "document_type": analysis.get("document_type", "document"),
        "summary_embedding": summary_embedding,
        "content_embedding": content_embedding,
    }
