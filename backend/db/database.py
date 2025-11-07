import os
import duckdb
from backend.core.config import settings
from backend.core.logging import logger

class Database:
    def __init__(self):
        self.db_path = settings.DB_PATH
        self._ensure_db_dir()
        self.connection = self._connect()
        self._init_db()
    
    def _ensure_db_dir(self):
        db_dir = os.path.dirname(self.db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
    
    def _connect(self):
        return duckdb.connect(database=self.db_path, read_only=False)
    
    def _init_db(self):
        # Create sequence for auto-incrementing ID
        self.connection.execute("DROP SEQUENCE IF EXISTS doc_id_seq")
        self.connection.execute("CREATE SEQUENCE doc_id_seq")
        
        # Create documents table
        self.connection.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY DEFAULT nextval('doc_id_seq'),
                title TEXT,
                content TEXT,
                embedding JSON
            );
        """)
        
        # Clear old documents (you might want to remove this in production)
        logger.info("Clearing old documents from the database due to embedding model change.")
        self.connection.execute("DELETE FROM documents;")
        logger.info("Database cleared.")
    
    def insert_document(self, title: str, content: str, embedding: str) -> int:
        self.connection.execute(
            "INSERT INTO documents (title, content, embedding) VALUES (?, ?, ?)",
            (title, content, embedding)
        )
        result = self.connection.execute("SELECT currval('doc_id_seq')").fetchone()
        return result[0] if result else -1
    
    def get_all_documents(self):
        return self.connection.execute("SELECT id, title FROM documents").fetchall()
    
    def get_documents_with_embeddings(self):
        return self.connection.execute("SELECT id, title, content, embedding FROM documents").fetchall()
    
    def get_document_count(self):
        result = self.connection.execute("SELECT COUNT(*) FROM documents").fetchone()
        return result[0] if result else 0

db = Database()