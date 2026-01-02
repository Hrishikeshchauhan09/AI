import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import logging

load_dotenv()

from agent import AgentManager
from memory import MemoryManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Companion API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Managers
agent_manager = AgentManager()
memory_manager = MemoryManager()

class ChatRequest(BaseModel):
    message: str
    history: list = [] # List of {"role": "user"|"ai", "content": "..."}

@app.get("/")
async def root():
    return {"message": "AI Companion Backend is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Companion API"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received message: {request.message[:50]}...")
        
        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # 1. Retrieve context from memory (optional enhancement)
        context = await memory_manager.retrieve_context(request.message)
        
        # 2. Get response from Agent
        response = await agent_manager.process_message(request.message, request.history)
        
        # 3. Save interaction to memory
        await memory_manager.add_interaction(request.message, response)
        
        logger.info(f"Generated response: {response[:50]}...")
        return {"response": response}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
