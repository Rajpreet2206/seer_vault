import PyPDF2
from typing import Dict, Any
from pathlib import Path
import re

async def clean_text(text: str) -> str:
    """Clean extracted text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    # Clean up
    text = text.strip()
    return text

async def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF files"""
    try:
        text = []
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            # Extract from first 3 pages max
            for i, page in enumerate(pdf_reader.pages[:3]):
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        
        combined = "\n".join(text)
        cleaned = await clean_text(combined)
        return cleaned[:1000]  # First 1000 chars
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

async def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX files"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        cleaned = await clean_text(text)
        return cleaned[:1000]
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

async def extract_metadata(filename: str, file_path: str) -> Dict[str, Any]:
    """Extract basic metadata from files"""
    file_ext = Path(file_path).suffix.lower()
    
    metadata = {
        "filename": filename,
        "file_type": file_ext,
        "size": Path(file_path).stat().st_size,
    }
    
    # Extract content based on file type
    content = ""
    if file_ext == ".pdf":
        content = await extract_text_from_pdf(file_path)
    elif file_ext == ".docx":
        content = await extract_text_from_docx(file_path)
    elif file_ext == ".txt":
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = await clean_text(f.read())
        except:
            content = ""
    
    metadata["content"] = content if content else "No text content extracted"
    return metadata
