import sqlalchemy
from sqlalchemy import inspect, text
import ssl
from dotenv import load_dotenv
import os
load_dotenv()

# Create SSL context (required for AlloyDB)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE  # For testing

engine = sqlalchemy.create_engine(
    sqlalchemy.engine.url.URL.create(
        drivername=os.getenv("DB_DRIVER"),
        username=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        database=os.getenv("DB_NAME")
    ),
    connect_args={
        "ssl_context": ssl_context
    }
)


try:
    with engine.connect() as conn:
        print("✓ Connection successful!")
        
        # Create the table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS seervault_file_contexts (
            id SERIAL PRIMARY KEY,
            file_name VARCHAR(255) NOT NULL,
            file_summary VARCHAR(500) NOT NULL,
            file_content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            relations TEXT,
            metadata JSONB
        );
        """
        
        conn.execute(text(create_table_sql))
        conn.commit()
        print("✓ Table 'seervault_file_contexts' created successfully!")
        
        # Verify the table was created
        inspector = inspect(engine)
        columns = inspector.get_columns("seervault_file_contexts", schema="public")
        
        print("\nColumns in 'seervault_file_contexts':")
        for col in columns:
            print(f"  - {col['name']}: {col['type']} (nullable: {col['nullable']})")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()