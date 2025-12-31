import os
import chromadb
from chromadb.config import Settings
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

class MemoryManager:
    def __init__(self, persist_dir="./chroma_db"):
        self.persist_dir = persist_dir
        # Initialize Chrome client
        self.client = chromadb.PersistentClient(path=persist_dir)
        
        # We will use a simple collection for conversation history
        self.collection_name = "conversation_history"
        
        # Embeddings - Using Google's for now, needs API KEY
        # Fallback or specific configuration should be handled in env vars
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        
        self.vector_store = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
        )

    async def add_interaction(self, user_input: str, ai_response: str):
        """Stores the interaction in the vector DB."""
        # We store the combined turn or separate them. A combined turn is often better for context.
        doc = Document(
            page_content=f"User: {user_input}\nAI: {ai_response}",
            metadata={"type": "interaction"}
        )
        self.vector_store.add_documents([doc])

    async def retrieve_context(self, query: str, k: int = 3):
        """Retrieves relevant past interactions."""
        # Simple similarity search
        docs = self.vector_store.similarity_search(query, k=k)
        return [d.page_content for d in docs]
