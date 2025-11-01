import json
import requests
from datetime import datetime
from typing import List, Dict, Any
from elasticsearch import Elasticsearch
from .config import CONNECTOR_CONFIG

class SeerVaultCRMConnector:
    """Fivetran-style connector for CRM data"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or CONNECTOR_CONFIG
        self.es_client = Elasticsearch([
            f"http://{self.config['destination']['host']}:{self.config['destination']['port']}"
        ])
        self.index_name = self.config['destination']['index']
        self.use_mock = self.config['sync_config']['use_mock_data']
        self.last_sync = None
        self._initialize_index()
    
    def _initialize_index(self):
        """Create Elasticsearch index for CRM data"""
        if not self.es_client.indices.exists(index=self.index_name):
            self.es_client.indices.create(
                index=self.index_name,
                body={
                    "settings": {
                        "number_of_shards": 1,
                        "number_of_replicas": 0,
                    },
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
    
    def fetch_crm_data(self, endpoint: str, incremental: bool = False) -> List[Dict[str, Any]]:
        """Fetch data from CRM API or mock data"""
        try:
            if self.use_mock:
                data = self._get_mock_data(endpoint)
            else:
                data = self._fetch_from_api(endpoint, incremental)
            
            print(f"Fetched {len(data)} records from {endpoint}")
            return data
        except Exception as e:
            print(f"Error fetching from {endpoint}: {e}")
            return []
    
    def _fetch_from_api(self, endpoint: str, incremental: bool) -> List[Dict[str, Any]]:
        """Fetch from real CRM API"""
        url = f"{self.config['source']['base_url']}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.config['source']['api_key']}",
            "Content-Type": "application/json"
        }
        
        params = {}
        if incremental and self.last_sync:
            params['updated_since'] = self.last_sync
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
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
        elif endpoint == "/companies":
            return [
                {
                    "id": "comp_001",
                    "name": "Acme Corporation",
                    "email": "info@acme.com",
                    "status": "active",
                    "created_at": "2024-01-10",
                    "updated_at": "2024-10-15",
                },
            ]
        return []
    
    def sync_data(self, incremental: bool = False):
        """Sync CRM data to Elasticsearch"""
        try:
            synced_count = 0
            for endpoint_name, endpoint_path in self.config['source']['endpoints'].items():
                data = self.fetch_crm_data(endpoint_path, incremental)
                for record in data:
                    record['data_type'] = endpoint_name
                    record['source'] = 'crm'
                    self._index_record(record)
                    synced_count += 1
            
            self.last_sync = datetime.now().isoformat()
            print(f"Sync completed: {synced_count} records synced")
            return {
                "status": "success",
                "records_synced": synced_count,
                "synced_at": self.last_sync,
                "sync_type": "incremental" if incremental else "full"
            }
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
                "last_sync": self.last_sync or "never",
                "index": self.index_name,
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
