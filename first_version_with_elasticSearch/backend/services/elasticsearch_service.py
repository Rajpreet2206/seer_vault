from elasticsearch import Elasticsearch
from typing import List, Dict, Any
from services.embedding_service import get_embedding

es_client = Elasticsearch(["http://localhost:9200"])

async def create_index(index_name: str):
    """Create Elasticsearch index with AI features"""
    if not es_client.indices.exists(index=index_name):
        es_client.indices.create(
            index=index_name,
            body={
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0,
                },
                "mappings": {
                    "properties": {
                        "file_id": {"type": "keyword"},
                        "filename": {"type": "text"},
                        "content": {"type": "text"},
                        "content_embedding": {
                            "type": "dense_vector",
                            "dims": 384,
                            "index": True,
                            "similarity": "cosine"
                        },
                        "file_type": {"type": "keyword"},
                        "uploaded_at": {"type": "date"},
                        "summary": {"type": "text"},
                        "topics": {"type": "keyword"},
                        "entities": {"type": "keyword"},
                        "summary_embedding": {
                            "type": "dense_vector",
                            "dims": 384,
                            "index": True,
                            "similarity": "cosine"
                        },
                        "ai_processed": {"type": "boolean"},
                    }
                },
            },
        )
        print(f"Index '{index_name}' created with AI features")

async def index_document(index_name: str, doc_id: str, document: Dict[str, Any]):
    """Index a document with AI features"""
    try:
        es_client.index(index=index_name, id=doc_id, document=document)
        print(f"Document {doc_id} indexed with AI features")
    except Exception as e:
        print(f"Indexing error: {e}")

async def hybrid_search(index_name: str, query: str, top_k: int = 10) -> List[Dict]:
    """Hybrid search: BM25 + semantic embeddings"""
    try:
        # Generate query embedding
        query_embedding = await get_embedding(query)
        
        response = es_client.search(
            index=index_name,
            body={
                "knn": {
                    "field": "content_embedding",
                    "query_vector": query_embedding,
                    "k": top_k,
                    "num_candidates": 100
                },
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["filename^3", "summary^2", "topics", "content", "entities"],
                        "fuzziness": "AUTO"
                    }
                },
                "size": top_k,
            },
        )
        
        results = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            source["score"] = hit["_score"]
            # Remove embeddings from response
            if "content_embedding" in source:
                del source["content_embedding"]
            if "summary_embedding" in source:
                del source["summary_embedding"]
            results.append(source)
        
        return results
    except Exception as e:
        print(f"Search error: {e}")
        # Fallback to keyword-only search
        try:
            response = es_client.search(
                index=index_name,
                body={
                    "query": {
                        "multi_match": {
                            "query": query,
                            "fields": ["filename^3", "summary^2", "topics", "content", "entities"],
                            "fuzziness": "AUTO"
                        }
                    },
                    "size": top_k,
                },
            )
            results = []
            for hit in response["hits"]["hits"]:
                source = hit["_source"]
                source["score"] = hit["_score"]
                if "content_embedding" in source:
                    del source["content_embedding"]
                if "summary_embedding" in source:
                    del source["summary_embedding"]
                results.append(source)
            return results
        except Exception as e2:
            print(f"Fallback search error: {e2}")
            return []

async def health_check() -> bool:
    """Check if Elasticsearch is healthy"""
    try:
        es_client.info()
        return True
    except Exception as e:
        print(f"Elasticsearch error: {e}")
        return False
