from functions.tool_functions import get_purchase_orders

tool_mapper = {
    "tool_get_purchase_orders": get_purchase_orders,
}

def tool_picker(llm_tool_result):

    tool_call_data = llm_tool_result.tool_calls

    tools=[]

    for tool in tool_call_data:
        tools.append(tool_mapper.get(tool["name"]))

    return tools