import asyncio
import os
from google import genai
from google.adk.models import Gemini
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import FunctionTool
from google.genai import types

# Step 1: Define custom functions
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together"""
    return a + b

def multiply_numbers(a: int, b: int) -> int:
    """Multiply two numbers"""
    return a * b

def get_greeting(name: str) -> str:
    """Return a greeting for a person"""
    return f"Hello, {name}! Welcome to the ADK Agent."

# Step 2: Create FunctionTool objects from functions
add_tool = FunctionTool(add_numbers)
multiply_tool = FunctionTool(multiply_numbers)
greeting_tool = FunctionTool(get_greeting)

async def main():
    print("=" * 60)
    print("Google ADK Agent with Custom Tools")
    print("=" * 60)

    try:
        # Step 3: Get API key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        print("\n✓ API key loaded")
        
        # Step 4: Create Gemini client and model
        client = genai.Client(api_key=api_key)
        gemini_model = Gemini(model="gemini-2.5-flash", client=client)
        
        print("✓ Gemini model created")
        
        # Step 5: Create agent with custom tools
        agent = Agent(
            name="calculator_assistant",
            model=gemini_model,
            instruction="You are a helpful assistant. Use the available tools to help the user.",
            description="An assistant that can do math and greetings.",
            tools=[add_tool, multiply_tool, greeting_tool]
        )
        
        print("✓ Agent created with 3 custom tools:")
        print("  - add_numbers(a, b)")
        print("  - multiply_numbers(a, b)")
        print("  - get_greeting(name)")
        
        # Step 6: Set up session and runner
        session_service = InMemorySessionService()
        await session_service.create_session(
            app_name="calculator_app",
            user_id="user_1",
            session_id="session_1"
        )
        
        runner = Runner(
            agent=agent,
            app_name="calculator_app",
            session_service=session_service
        )
        
        print("✓ Runner initialized\n")
        
        # Step 7: Ask the agent questions
        questions = [
            "What is 15 plus 25?"
        ]
        
        for question in questions:
            print(f"\nUser: {question}")
            print("-" * 40)
            
            content = types.Content(
                role="user",
                parts=[types.Part(text=question)]
            )
            
            events = runner.run(
                user_id="user_1",
                session_id="session_1",
                new_message=content
            )
            
            for event in events:
                if event.is_final_response():
                    response = event.content.parts[0].text
                    print(f"Agent: {response}")
                    break
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 60)
    print("Script finished!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())