import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    convert_system_message_to_human=True,
    temperature=0.7
)

# Define System Prompt
SYSTEM_PROMPT = """You are an AI Companion. You are a friend to the user.
You have a 3D avatar that represents you.
Your goal is to be helpful, empathetic, and engaging.

You must speak in the language the user speaks (English, Hindi, or Marathi).
- If the user speaks Hindi, reply in Hindi (हिंदी).
- If the user speaks Marathi, reply in Marathi (मराठी).
- If the user speaks English, reply in English.

You should be conversational and friendly. Keep responses concise but helpful (2-3 sentences usually).

Safety Guidelines:
- Do not provide instructions for harmful activities.
- If the user shares negative feelings, be supportive but suggest professional help if it seems serious.
- Do not engage in explicit sexual content.
"""

class AgentManager:
    def __init__(self):
        self.llm = llm
        self.system_prompt = SYSTEM_PROMPT

    async def process_message(self, message: str, history: list):
        """
        Process a user message and generate a response.
        
        Args:
            message: The user's current message
            history: List of previous messages [{"role": "user"|"ai", "content": "..."}]
        
        Returns:
            str: The AI's response
        """
        try:
            # Build message history
            messages = [SystemMessage(content=self.system_prompt)]
            
            # Add conversation history (last 10 messages to keep context manageable)
            for msg in history[-10:]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "ai":
                    messages.append(AIMessage(content=msg["content"]))
            
            # Add current message
            messages.append(HumanMessage(content=message))
            
            # Get response from LLM
            response = await self.llm.ainvoke(messages)
            
            return response.content
            
        except Exception as e:
            print(f"Error in process_message: {e}")
            # Fallback response
            return "I apologize, but I'm having trouble processing your message right now. Please try again."
