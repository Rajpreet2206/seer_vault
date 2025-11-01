from typing import List, Dict, Any

async def decompose_query(query: str) -> Dict[str, Any]:
    """Break down user query into structured parts"""
    query_lower = query.lower()
    
    # Detect what user wants
    intents = []
    if any(word in query_lower for word in ["find", "search", "locate", "get"]):
        intents.append("search")
    if any(word in query_lower for word in ["recent", "latest", "new"]):
        intents.append("recent")
    if any(word in query_lower for word in ["pdf", "document", "report"]):
        intents.append("pdf")
    
    return {
        "original_query": query,
        "intents": intents if intents else ["search"],
    }

async def generate_response(query: str, results: List[Dict[str, Any]]) -> str:
    """Generate smart response based on results"""
    if not results:
        return f"No files found for '{query}'. Try uploading more documents."
    
    if len(results) == 1:
        result = results[0]
        match_percent = int(result.get("score", 0) * 100)
        return f"Found: {result['filename']} ({result['file_type']}) - {match_percent}% match"
    else:
        top = results[0]
        match_percent = int(top.get("score", 0) * 100)
        return f"Found {len(results)} files. Best match: {top['filename']} - {match_percent}% match"
