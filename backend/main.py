import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agent import AgentManager
from memory import MemoryManager

load_dotenv()

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
    return {"message": "AI Companion Backend is running!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # 1. Retrieve context from memory (optional enhancement, skipping for basic flow or can be added to prompt)
        context = await memory_manager.retrieve_context(request.message)
        
        # 2. Add context to message or system prompt (simplified here, agent handles history)
        # For now, we trust the agent's memory of the immediate session + vector store if integrated in agent
        
        # 3. Get response from Agent
        response = await agent_manager.process_message(request.message, request.history)
        
        # 4. Save interaction to memory
        await memory_manager.add_interaction(request.message, response)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
