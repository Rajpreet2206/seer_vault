import sqlalchemy
from sqlalchemy import text, inspect
import ssl
from dotenv import load_dotenv
import os
load_dotenv()
# Create SSL context
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

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
    # Show table fields/columns
    inspector = inspect(engine)
    columns = inspector.get_columns("seervault_file_contexts", schema="public")
    
    print("=== Table Fields ===")
    for col in columns:
        print(f"  - {col['name']}: {col['type']}")
    
    print("\n=== Table Contents ===")
    
    with engine.connect() as conn:
        # Fetch all rows from the table
        result = conn.execute(text("SELECT * FROM seervault_file_contexts;"))
        rows = result.fetchall()
        
        if rows:
            print(f"Found {len(rows)} rows:\n")
            for row in rows:
                print(row)
        else:
            print("Table is empty!")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()