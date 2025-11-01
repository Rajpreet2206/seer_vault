from typing import List, Dict, Any
from sentence_transformers import CrossEncoder

# Load cross-encoder model (smaller, faster variant)
cross_encoder = CrossEncoder('cross-encoder/mmarco-MiniLMv2-L12-H384-v1')

async def rerank_results(query: str, results: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Re-rank search results using cross-encoder.
    
    Mathematical Principle:
    - Input: Query + Document pairs
    - Process: Neural network learns interaction patterns between query and doc
    - Output: Relevance score (0-1) directly from interaction
    - Advantage: Captures complex query-document relationships that cosine similarity misses
    """
    if not results:
        return results
    
    try:
        # Prepare pairs for cross-encoder
        pairs = [
            [query, result.get("filename", "") + " " + result.get("summary", "")[:200]]
            for result in results
        ]
        
        # Get relevance scores
        scores = cross_encoder.predict(pairs)
        
        # Add scores and sort
        for i, result in enumerate(results):
            result["cross_encoder_score"] = float(scores[i])
        
        # Sort by cross-encoder score
        reranked = sorted(results, key=lambda x: x["cross_encoder_score"], reverse=True)
        
        print(f"Re-ranked {len(results)} results using cross-encoder")
        return reranked[:top_k]
        
    except Exception as e:
        print(f"Re-ranking error: {e}")
        return results[:top_k]
