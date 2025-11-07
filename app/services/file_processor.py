import os
import json
import logging
from google import genai

logger = logging.getLogger(__name__)

class FileProcessor:
    """Process files: extract content, analyze with Gemini, generate embeddings"""
    
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
    
    def read_file(self, filepath):
        """Read file content based on file type"""
        try:
            file_ext = os.path.splitext(filepath)[1].lower()
            logger.info(f"Detected file type: {file_ext}")
            
            # ===== TEXT FILES =====
            if file_ext in ['.txt', '.md', '.log']:
                logger.info("Reading as text file")
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                logger.info(f"Text file read successfully. Length: {len(content)} chars")
                return content
            
            # ===== PDF FILES =====
            elif file_ext == '.pdf':
                logger.info("Reading as PDF file")
                try:
                    import pdfplumber
                    text = ""
                    with pdfplumber.open(filepath) as pdf:
                        num_pages = len(pdf.pages)
                        logger.info(f"PDF has {num_pages} pages")
                        
                        # Limit to first 50 pages to avoid huge processing
                        pages_to_read = min(num_pages, 50)
                        
                        for i, page in enumerate(pdf.pages[:pages_to_read]):
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                            
                            if (i + 1) % 10 == 0:
                                logger.info(f"Extracted {i + 1}/{pages_to_read} pages")
                    
                    if not text.strip():
                        logger.warning("No text extracted from PDF")
                        return None
                    
                    logger.info(f"Extracted {len(text)} chars from PDF ({pages_to_read} pages)")
                    return text
                
                except ImportError:
                    logger.error("pdfplumber not installed. Install with: pip install pdfplumber")
                    return None
            
            # ===== DOCX FILES =====
            elif file_ext == '.docx':
                logger.info("Reading as DOCX file")
                try:
                    from docx import Document
                    doc = Document(filepath)
                    text = ""
                    for para in doc.paragraphs:
                        text += para.text + "\n"
                    
                    logger.info(f"DOCX file read successfully. Length: {len(text)} chars")
                    return text
                
                except ImportError:
                    logger.error("python-docx not installed. Install with: pip install python-docx")
                    return None
            
            # ===== IMAGE FILES (send to Vision API) =====
            elif file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                logger.info("Image file detected - will use Gemini Vision API")
                # Return file path - we'll handle this in extract_information
                return filepath
            
            # ===== UNSUPPORTED FILES =====
            else:
                logger.warning(f"Unsupported file type: {file_ext}")
                return None
        
        except UnicodeDecodeError:
            logger.error("File is not UTF-8 encoded")
            return None
        except Exception as e:
            logger.error(f"Error reading file: {type(e).__name__}: {e}")
            return None
    
    def extract_information(self, content, filepath=None):
        """Use Gemini to extract structured information"""
        try:
            # Check if content is a file path (image)
            file_ext = os.path.splitext(filepath)[1].lower() if filepath else ""
            
            if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                logger.info("Processing image with Gemini Vision API")
                return self._extract_from_image(filepath)
            else:
                logger.info("Processing text with Gemini API")
                return self._extract_from_text(content)
        
        except Exception as e:
            logger.error(f"Error extracting information: {e}")
            return None
    
    def _extract_from_text(self, content):
        """Extract from text content"""
        # Limit content to avoid token limits
        limited_content = content[:3000]
        
        prompt = f"""
        Analyze the following content and extract key information.
        
        Provide your response as valid JSON with these keys:
        - summary (string, 1-2 sentences)
        - key_topics (array of strings)
        - key_facts (array of strings)
        - entities (array of strings - names, places, organizations mentioned)
        - sentiment (string - positive, negative, or neutral)
        
        Content:
        {limited_content}
        
        IMPORTANT: Return ONLY valid JSON, no markdown, no extra text.
        """
        
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        response_text = response.text.strip()
        logger.info(f"Gemini response: {response_text[:200]}")
        
        # Extract JSON
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start == -1 or json_end == 0:
            logger.warning("No JSON found in response")
            return None
        
        json_str = response_text[json_start:json_end]
        extracted_info = json.loads(json_str)
        logger.info(f"Extracted information: {extracted_info}")
        return extracted_info
    
    def _extract_from_image(self, image_path):
        """Extract from image using Vision API"""
        with open(image_path, 'rb') as img_file:
            image_data = img_file.read()
        
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                "Analyze this image and provide:",
                "- A summary of what you see",
                "- Key topics or subjects",
                "- Any text visible in the image",
                "- Sentiment or tone if applicable",
                "Respond as JSON: {summary, key_topics, key_facts, entities, sentiment}",
                {"mime_type": "image/jpeg", "data": image_data}
            ]
        )
        
        response_text = response.text.strip()
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start == -1:
            return {"summary": response_text, "key_topics": [], "key_facts": [], "entities": [], "sentiment": "neutral"}
        
        json_str = response_text[json_start:json_end]
        return json.loads(json_str)
    
    def generate_embedding(self, text):
        """Generate embedding using Gemini API"""
        try:
            # Limit text to avoid token limits
            text = text[:2000]
            
            response = self.client.models.embed_content(
                model="text-embedding-004",
                contents=text
            )
            
            # The response has embeddings (plural) for batch requests
            if hasattr(response, 'embeddings') and response.embeddings:
                embedding = response.embeddings[0].values
            elif hasattr(response, 'embedding'):
                embedding = response.embedding
            else:
                logger.warning(f"Unexpected embedding response structure: {response}")
                return None
            
            logger.info(f"Generated embedding with {len(embedding)} dimensions")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {type(e).__name__}: {e}")
            return None
    
    def process_file(self, filepath, filename):
        """Main processing pipeline"""
        logger.info(f"Starting file processing: {filename}")
        
        # Read file
        content = self.read_file(filepath)
        if not content:
            logger.error("Failed to read file content")
            return None
        
        # For images, content will be file path
        file_ext = os.path.splitext(filepath)[1].lower()
        is_image = file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
        
        # Generate summary
        if is_image:
            summary = f"Image file: {filename}"
        else:
            summary = content[:500].replace('\n', ' ').strip()
        
        # Extract structured information
        extracted_info = self.extract_information(content, filepath)
        
        # Generate embedding (only from text, not images)
        embedding = None
        if not is_image:
            embedding = self.generate_embedding(content)
        
        # Get file size
        file_size = os.path.getsize(filepath)
        file_type = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'unknown'
        
        logger.info(f"File processing complete for {filename}")
        
        return {
            'file_summary': summary,
            'file_content': content if not is_image else summary,
            'embedding': embedding,
            'extracted_info': extracted_info,
            'file_type': file_type,
            'file_size': file_size
        }