import asyncio
from main_call import main_function
import json
from dotenv import load_dotenv
from llm_call.llm_calls import final_output_generation
load_dotenv()

async def run_test():
    user_query = "give 5 PO details"
    print(f"Running main_function with query: {user_query}\n")
    raw_response = await main_function(user_query)
    print(raw_response)
    print("Result:")
    # Print the result nicely formatted if it is a dict, else just print it.
    final_summary = await final_output_generation(raw_response)
    print(final_summary)

if __name__ == "__main__":
    asyncio.run(run_test())
