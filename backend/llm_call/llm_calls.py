import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda, RunnableParallel

load_dotenv(override=True)

llm_openai = ChatOpenAI(model="gpt-5.4-nano", temperature=0)

async def params_generation(user_prompt: str)->dict:
    
    from prompts.prompts import system_prompt
    from schema.pydantic_schema import PurchaseOrderFilters
    from langchain_core.prompts import ChatPromptTemplate
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "{system_input}"),
        ("human", "{user_input}")
    ])

    llm_structured_output = llm_openai.with_structured_output(PurchaseOrderFilters)

    chain = prompt_template | llm_structured_output

    response = await chain.ainvoke({"system_input": system_prompt, "user_input": user_prompt})
    
    return response.model_dump()



async def tool_call_generation(user_prompt:str):

    from tool_calls.tool_calls import tool_get_purchase_orders
    
    toolkit = [tool_get_purchase_orders]

    llm_bind_tools = llm_openai.bind_tools(toolkit)

    from langchain_core.prompts import ChatPromptTemplate

    prompt_template_2 = ChatPromptTemplate.from_messages([
        ("system", "You are the correct tool picking agent, based on the user query Make the tool calls"),
        ("human", "{user_query}")
    ])

    chain = prompt_template_2 | llm_bind_tools

    response = await chain.ainvoke({"user_query": user_prompt})

    return response



params_generation_runnable = RunnableLambda(params_generation)
tool_call_generation_runnable = RunnableLambda(tool_call_generation)


parallel_llm_runnable= RunnableParallel({
    "params_gen":params_generation_runnable,
    "tools_gen":tool_call_generation_runnable 
})


async def final_output_generation(llm_final_result:dict):
    
    from prompts.prompts import system_prompt_final_llm
    from langchain_core.prompts import ChatPromptTemplate
    
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "{final_system_input}"),
        ("human", "{final_user_input}")
    ])

    chain = prompt_template | llm_openai

    response = await chain.ainvoke({"final_system_input": system_prompt_final_llm, "final_user_input": llm_final_result})
    
    return response.content