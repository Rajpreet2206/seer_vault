import os
from dotenv import load_dotenv

load_dotenv()

CONNECTOR_CONFIG = {
    "name": "SeerVault CRM Connector",
    "version": "1.0.0",
    "description": "Connects to CRM system and syncs data into SeerVault",
    "source": {
        "type": "rest_api",
        "base_url": os.getenv("CRM_API_URL", "https://api.example-crm.com"),
        "api_key": os.getenv("CRM_API_KEY", ""),
        "endpoints": {
            "customers": "/customers",
            "deals": "/deals",
            "companies": "/companies"
        }
    },
    "destination": {
        "type": "elasticsearch",
        "host": os.getenv("ELASTICSEARCH_HOST", "localhost"),
        "port": int(os.getenv("ELASTICSEARCH_PORT", 9200)),
        "index": "seervault-crm-data"
    },
    "sync_config": {
        "full_sync_interval": 3600,
        "incremental_sync_interval": 300,
        "batch_size": 100,
        "max_retries": 3,
        "use_mock_data": os.getenv("USE_MOCK_DATA", "true").lower() == "true"
    }
}
