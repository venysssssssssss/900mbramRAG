import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    JINA_API_KEY = os.getenv("JINA_API_KEY")
    
    # Model settings
    GEMINI_GEN_MODEL = os.getenv("GEMINI_GEN_MODEL", "gemini-1-pro")
    JINA_EMBED_MODEL = "jina-embeddings-v2-base-en"
    
    # Database settings
    DB_PATH = os.getenv("DB_PATH", "./data/docs.db")
    
    # Application settings
    TOP_K = int(os.getenv("TOP_K", 3))
    MAX_DOCS = int(os.getenv("MAX_DOCS", 500))
    MAX_DOC_SIZE = 10 * 1024 * 1024  # 10MB limit for document size

    def validate(self):
        if not self.GEMINI_API_KEY or self.GEMINI_API_KEY == "xxx":
            raise ValueError("GEMINI_API_KEY not found or not set in .env file.")
        if not self.JINA_API_KEY:
            raise ValueError("JINA_API_KEY not found or not set in .env file.")

settings = Settings()