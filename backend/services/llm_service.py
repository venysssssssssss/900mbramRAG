import google.generativeai as genai
from fastapi import HTTPException
from backend.core.config import settings
from backend.core.logging import logger

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_GEN_MODEL
        genai.configure(api_key=self.api_key)
    
    async def generate_response(self, prompt: str) -> str:
        """Calls the Gemini LLM to generate content based on the prompt."""
        try:
            logger.info(f"Calling Gemini model {self.model_name}...")
            model = genai.GenerativeModel(self.model_name)
            resp = await model.generate_content_async(prompt)
            logger.info("LLM response received.")
            return resp.text
        except Exception as e:
            logger.error(f"Error calling Gemini LLM: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get response from LLM: {e}")

llm_service = LLMService()