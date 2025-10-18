# Fivetran Connector Configuration for SeerVault

CONNECTOR_CONFIG = {
    "name": "SeerVault CRM Connector",
    "version": "1.0.0",
    "description": "Connects to CRM system and syncs customer data into SeerVault",
    "source": {
        "type": "rest_api",
        "base_url": "https://api.example-crm.com",
        "endpoints": {
            "customers": "/customers",
            "deals": "/deals",
            "companies": "/companies"
        }
    },
    "destination": {
        "type": "elasticsearch",
        "host": "localhost",
        "port": 9200,
        "index": "seervault-crm-data"
    },
    "sync_config": {
        "full_sync_interval": 3600,  # Full sync every hour
        "incremental_sync_interval": 300,  # Incremental sync every 5 minutes
        "batch_size": 100,
        "max_retries": 3
    }
}
