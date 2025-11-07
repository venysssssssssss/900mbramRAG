import json
import httpx
from fastapi import HTTPException
from backend.core.config import settings
from backend.core.logging import logger

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.JINA_API_KEY
        self.model = settings.JINA_EMBED_MODEL
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    async def get_embedding(self, text: str) -> list:
        """Generates embeddings using the Jina AI API."""
        try:
            logger.info(f"Requesting Jina embedding for text snippet: {text[:80]}...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.jina.ai/v1/embeddings",
                    json={"input": [text], "model": self.model},
                    headers=self.headers
                )
                response.raise_for_status()
                embedding = response.json()["data"][0]["embedding"]
                logger.info("Jina embedding received.")
                return embedding
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error calling Jina API: {e.response.status_code} {e.response.text}")
            raise HTTPException(status_code=500, detail=f"Failed to generate embedding via Jina API: {e.response.text}")
        except Exception as e:
            logger.error(f"Error getting embedding from Jina: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {e}")

embedding_service = EmbeddingService()