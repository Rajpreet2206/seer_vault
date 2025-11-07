import asyncio
import os
from google import genai
from google.adk.models import Gemini
from google.adk.agents import Agent
from google.adk.tools import google_search
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

async def main():
    print("1. Starting script...")

    try:
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        print("2. Creating Gemini client with API key...")
        # Create a preconfigured client with API key
        client = genai.Client(api_key=api_key)
        
        print("3. Creating Gemini model...")
        # Create Gemini model with the client
        gemini_model = Gemini(model="gemini-2.5-flash", client=client)
        
        print("4. Creating Agent...")
        root_agent = Agent(
            name="search_assistant",
            model=gemini_model,
            instruction="You are a helpful assistant. Answer user questions using Google Search when needed.",
            description="An assistant that can search the web.",
            tools=[google_search]
        )
        
        print("5. ✓ Agent created successfully!")
        print(f"   Agent name: {root_agent.name}\n")
        
        # Set up runner and session
        APP_NAME = "search_app"
        USER_ID = "user_123"
        SESSION_ID = "session_456"
        
        session_service = InMemorySessionService()
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID
        )
        
        runner = Runner(
            agent=root_agent,
            app_name=APP_NAME,
            session_service=session_service
        )
        
        # Ask the agent a question
        question = "What is the capital of France?"
        print(f"6. Asking: '{question}'")
        print("   Waiting for response...\n")
        
        # Create content from user query
        content = types.Content(
            role="user",
            parts=[types.Part(text=question)]
        )
        
        # Run the agent
        events = runner.run(
            user_id=USER_ID,
            session_id=SESSION_ID,
            new_message=content
        )
        
        print("7. ✓ Agent response:")
        for event in events:
            if event.is_final_response():
                response_text = event.content.parts[0].text
                print(f"   {response_text}\n")
                break
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

    print("8. Script finished!")

if __name__ == "__main__":
    asyncio.run(main())