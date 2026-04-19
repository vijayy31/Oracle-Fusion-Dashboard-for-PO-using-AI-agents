async def main_function(user_prompt:str):

    from llm_call.llm_calls import parallel_llm_runnable
    from mappers.tool_mappers import tool_picker
    from utils.utils import valid_query_check,result_parsing
    from prompts.prompts import invalid_prompt_string

    error = "Unexpected Error: LLM did not return the expected result. Try Again :)"

    try:
        llm_result = await parallel_llm_runnable.ainvoke({"user_prompt":user_prompt})
    except Exception as e:
        return{
            "success": False,
            "error": f"{error} + {str(e)}"
        }
    
    llm_params_result =  llm_result.get("params_gen")
    llm_tools_result = llm_result.get("tools_gen")

    if not llm_params_result or not llm_tools_result:
        return{
            "success": False,
            "error": invalid_prompt_string
        }
    
    is_valid_query = valid_query_check(user_prompt, llm_params_result)

    if not is_valid_query:
        return{
            "success": False,
            "error": invalid_prompt_string
        }
    
    tools = tool_picker(llm_tools_result)

    if tools.__len__() == 0:
        return{
            "success": False,
            "error": invalid_prompt_string
        }

    final_result= {}

    try:
        for tool_function in tools:

            final_result[tool_function.__name__]= await tool_function(llm_params_result)

        return result_parsing(tools, final_result)

    except Exception as e:
        return{
            "success": False,
            "error": f"{error} + {str(e)}"
        }