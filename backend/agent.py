import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableWithMessageHistory
# Handling potential import location changes across versions
try:
    from langchain.agents import AgentExecutor, create_tool_calling_agent
except ImportError:
    from langchain.agents.agent import AgentExecutor
    from langchain.agents import create_tool_calling_agent

from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, AIMessage

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", convert_system_message_to_human=True)

# Define Tools
search_tool = DuckDuckGoSearchRun()
tools = [search_tool]

# Define System Prompt
SYSTEM_PROMPT = """You are an AI Companion. You are a friend to the user.
You have a 3D avatar that represents you.
Your goal is to be helpful, empathetic, and engaging.
You can use tools to search the internet if the user asks for information.
You must speak in the language the user speaks (English, Hindi, or Marathi).
If the user speaks Hindi/Marathi, reply in that language.

Safety Guidelines:
- Do not provide instructions for harmful activities.
- If the user shares negative feelings, be supportive but suggest professional help if it seems serious.
- Do not engage in explicit sexual content.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Create Agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

class AgentManager:
    def __init__(self):
        self.executor = agent_executor

    async def process_message(self, message: str, history: list):
        # Convert history dicts to LangChain messages
        chat_history = []
        for msg in history:
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "ai":
                chat_history.append(AIMessage(content=msg["content"]))
        
        result = await self.executor.ainvoke({
            "input": message,
            "chat_history": chat_history
        })
        
        return result["output"]
