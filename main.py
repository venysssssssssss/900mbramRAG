from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.core.config import settings
from backend.api.routes import documents, health

# Initialize FastAPI app
app = FastAPI(
    title="RAG MVP with Jina & Gemini",
    description="A RAG implementation using Jina for embeddings and Gemini for generation.",
)

# Include routers
app.include_router(documents.router)
app.include_router(health.router)

# Mount static directory for frontend
app.mount("/", StaticFiles(directory="frontend/static", html=True), name="static")


# Validate settings on startup
@app.on_event("startup")
async def startup_event():
    settings.validate()