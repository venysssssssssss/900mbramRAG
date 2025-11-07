import io
import json
import docx
import pypdf
from fastapi import HTTPException
from backend.core.config import settings
from backend.core.logging import logger
from backend.db.database import db
from backend.utils.similarity import cosine_similarity
from backend.services.embedding_service import embedding_service

class DocumentService:
    def __init__(self):
        self.max_docs = settings.MAX_DOCS
        self.max_doc_size = settings.MAX_DOC_SIZE
        self.top_k = settings.TOP_K
    
    async def extract_text(self, file_obj, filename: str) -> str:
        """Extract text from various document formats."""
        try:
            contents = await file_obj.read()
            text = ""
            
            if filename.endswith(".pdf"):
                reader = pypdf.PdfReader(io.BytesIO(contents))
                for page in reader.pages:
                    text += page.extract_text() or ""
            elif filename.endswith(".docx"):
                doc = docx.Document(io.BytesIO(contents))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            elif filename.endswith((".txt", ".md")):
                text = contents.decode('utf-8')
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: .{filename.split('.')[-1]}. Supported types: .pdf, .docx, .txt, .md"
                )
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="No text could be extracted from the document.")
            
            return text
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Invalid file content. Only UTF-8 text files are supported.")
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {str(e)}")
    
    async def upload_document(self, file_obj) -> dict:
        """Upload and process a document."""
        # Check document limit
        if db.get_document_count() >= self.max_docs:
            raise HTTPException(status_code=400, detail=f"Database is full. Maximum of {self.max_docs} documents allowed.")
        
        # Read file
        contents = await file_obj.read()
        if len(contents) > self.max_doc_size:
            raise HTTPException(status_code=413, detail=f"File size exceeds the limit of {self.max_doc_size} bytes.")
        await file_obj.seek(0)  # Reset file pointer
        
        # Extract text
        text_content = await self.extract_text(file_obj, file_obj.filename)
        
        # Generate embedding
        embedding = await embedding_service.get_embedding(text_content)
        
        try:
            # Save to database
            doc_id = db.insert_document(file_obj.filename, text_content, json.dumps(embedding))
            logger.info(f"Document '{file_obj.filename}' (ID: {doc_id}) uploaded and indexed successfully.")
            return {
                "message": "Document uploaded successfully",
                "doc_id": doc_id,
                "filename": file_obj.filename
            }
        except Exception as e:
            logger.error(f"Database error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save document to database: {e}")
    
    def list_documents(self):
        """List all documents in the database."""
        docs = db.get_all_documents()
        return [{"id": row[0], "title": row[1]} for row in docs]
    
    async def find_similar_documents(self, query_embedding: list):
        """Find documents similar to the query embedding."""
        all_docs = db.get_documents_with_embeddings()
        if not all_docs:
            return []
        
        logger.info(f"Calculating similarities against {len(all_docs)} documents...")
        similarities = []
        for doc_id, title, content, embedding_json in all_docs:
            doc_embedding = json.loads(embedding_json)
            similarity = cosine_similarity(query_embedding, doc_embedding)
            similarities.append((similarity, doc_id, title, content))
        
        similarities.sort(key=lambda x: x[0], reverse=True)
        return similarities[:self.top_k]

document_service = DocumentService()