from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from backend.core.logging import logger
from backend.services.document_service import document_service
from backend.services.embedding_service import embedding_service
from backend.services.llm_service import llm_service

router = APIRouter()

@router.post("/upload", summary="Upload a document to the RAG DB")
async def upload_document(file: UploadFile = File(...)):
    """Uploads a document, generates its embedding using Jina, and stores it."""
    return await document_service.upload_document(file)

@router.post("/extract-text", summary="Extract text from a document")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from various document formats."""
    text = await document_service.extract_text(file, file.filename)
    return {"filename": file.filename, "text": text}

@router.get("/query", summary="Query the RAG system")
async def query_rag(q: str = Query(..., min_length=3, description="Your question for the RAG system.")):
    """Query the RAG system with a question."""
    logger.info(f"Received query: '{q}'")
    
    # Generate embedding for query
    query_embedding = await embedding_service.get_embedding(q)
    
    # Find similar documents
    similar_docs = await document_service.find_similar_documents(query_embedding)
    if not similar_docs:
        return {
            "answer": "The document database is empty. Please upload some documents first.",
            "contexts": []
        }
    
    # Format context and response
    context_str = ""
    contexts_for_response = []
    for sim, doc_id, title, content in similar_docs:
        context_str += f"### [id={doc_id}] Title: {title}\n{content}\n###\n\n"
        contexts_for_response.append({
            "id": doc_id,
            "title": title,
            "similarity": round(sim, 4)
        })
    
    # Generate prompt and get LLM response
    prompt_template = f'''
You are a helpful assistant. Use the CONTEXT sections below to answer the QUESTION.
If the answer is not present in the context, answer "I don't know".

CONTEXT:
{context_str}QUESTION: {q}

Answer concisely and include the source id(s) in your answer (e.g., [id=12]).
'''
    
    answer = await llm_service.generate_response(prompt_template)
    
    return {"answer": answer, "contexts": contexts_for_response}

@router.get("/documents", summary="List all documents")
def list_documents():
    """Lists all documents currently stored in the database (ID and title only)."""
    return document_service.list_documents()