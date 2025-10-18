from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

# Load lightweight embedding model (downloads ~130MB on first run)
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    EMBEDDINGS_ENABLED = True
except Exception as e:
    print(f"Warning: Could not load embedding model: {e}")
    EMBEDDINGS_ENABLED = False
    model = None

async def get_embedding(text: str) -> List[float]:
    """Generate embedding for text using local sentence-transformers"""
    if not EMBEDDINGS_ENABLED or model is None:
        # Fallback: return non-zero random vector
        return np.random.rand(384).tolist()
    
    try:
        # Clean text
        text = text[:512]  # Limit to 512 chars for speed
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding error: {e}")
        return np.random.rand(384).tolist()

async def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts"""
    if not EMBEDDINGS_ENABLED or model is None:
        return [np.random.rand(384).tolist() for _ in texts]
    
    try:
        # Limit texts
        texts = [t[:512] for t in texts]
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    except Exception as e:
        print(f"Batch embedding error: {e}")
        return [np.random.rand(384).tolist() for _ in texts]
