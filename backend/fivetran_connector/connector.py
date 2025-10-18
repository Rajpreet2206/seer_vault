import json
import requests
from datetime import datetime
from typing import List, Dict, Any
from elasticsearch import Elasticsearch

class SeerVaultCRMConnector:
    """Basic Fivetran-style connector for CRM data"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.es_client = Elasticsearch([
            f"http://{config['destination']['host']}:{config['destination']['port']}"
        ])
        self.index_name = config['destination']['index']
        self._initialize_index()
    
    def _initialize_index(self):
        """Create Elasticsearch index for CRM data"""
        if not self.es_client.indices.exists(index=self.index_name):
            self.es_client.indices.create(
                index=self.index_name,
                body={
                    "settings": {"number_of_shards": 1, "number_of_replicas": 0},
                    "mappings": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "name": {"type": "text"},
                            "email": {"type": "keyword"},
                            "company": {"type": "text"},
                            "status": {"type": "keyword"},
                            "value": {"type": "float"},
                            "created_at": {"type": "date"},
                            "updated_at": {"type": "date"},
                            "data_type": {"type": "keyword"},
                            "source": {"type": "keyword"},
                        }
                    },
                },
            )
            print(f"Index '{self.index_name}' created")
    
    def fetch_crm_data(self, endpoint: str) -> List[Dict[str, Any]]:
        """Fetch data from CRM API"""
        try:
            url = f"{self.config['source']['base_url']}{endpoint}"
            headers = {"Authorization": "Bearer YOUR_API_KEY"}
            
            # For demo, return mock data
            mock_data = self._get_mock_data(endpoint)
            print(f"Fetched {len(mock_data)} records from {endpoint}")
            return mock_data
        except Exception as e:
            print(f"Error fetching from {endpoint}: {e}")
            return []
    
    def _get_mock_data(self, endpoint: str) -> List[Dict[str, Any]]:
        """Return mock CRM data for demonstration"""
        if endpoint == "/customers":
            return [
                {
                    "id": "cust_001",
                    "name": "Acme Corporation",
                    "email": "contact@acme.com",
                    "company": "Acme",
                    "status": "active",
                    "created_at": "2024-01-15",
                    "updated_at": "2024-10-15",
                },
                {
                    "id": "cust_002",
                    "name": "TechStart Inc",
                    "email": "sales@techstart.com",
                    "company": "TechStart",
                    "status": "active",
                    "created_at": "2024-02-20",
                    "updated_at": "2024-10-10",
                },
            ]
        elif endpoint == "/deals":
            return [
                {
                    "id": "deal_001",
                    "name": "Enterprise License Deal",
                    "company": "Acme",
                    "value": 50000,
                    "status": "closed_won",
                    "created_at": "2024-03-01",
                    "updated_at": "2024-10-01",
                },
                {
                    "id": "deal_002",
                    "name": "Startup Package",
                    "company": "TechStart",
                    "value": 15000,
                    "status": "negotiation",
                    "created_at": "2024-08-15",
                    "updated_at": "2024-10-12",
                },
            ]
        return []
    
    def sync_data(self):
        """Full sync of all CRM data"""
        try:
            for endpoint_name, endpoint_path in self.config['source']['endpoints'].items():
                data = self.fetch_crm_data(endpoint_path)
                for record in data:
                    record['data_type'] = endpoint_name
                    record['source'] = 'crm'
                    self._index_record(record)
            print("Sync completed successfully")
            return {"status": "success", "synced_at": datetime.now().isoformat()}
        except Exception as e:
            print(f"Sync failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def _index_record(self, record: Dict[str, Any]):
        """Index a single record in Elasticsearch"""
        try:
            doc_id = f"crm_{record.get('id', 'unknown')}"
            self.es_client.index(index=self.index_name, id=doc_id, document=record)
        except Exception as e:
            print(f"Error indexing record: {e}")
    
    def get_sync_status(self) -> Dict[str, Any]:
        """Get current sync status"""
        try:
            stats = self.es_client.indices.stats(index=self.index_name)
            doc_count = stats['indices'][self.index_name]['primaries']['docs']['count']
            return {
                "status": "healthy",
                "indexed_documents": doc_count,
                "last_sync": datetime.now().isoformat(),
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
