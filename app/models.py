from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'
    
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False, unique=True)
    file_summary = db.Column(db.String(500), nullable=True)
    file_content = db.Column(db.Text, nullable=True)
    
    # New fields for embeddings and extracted data
    relations = db.Column(db.Text, nullable=True)  # JSON string of relations
    file_metadata = db.Column(JSONB, nullable=True)  # Stores: {
                                                      #   "embeddings": [...],
                                                      #   "file_type": "txt",
                                                      #   "file_size": 1024,
                                                      #   "key_information": {...},
                                                      #   "processing_status": "completed"
                                                      # }
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<UploadedFile {self.file_name}>'