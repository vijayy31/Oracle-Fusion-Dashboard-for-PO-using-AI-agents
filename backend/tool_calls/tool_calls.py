from langchain_core.tools import tool

@tool
def tool_get_purchase_orders(llm_result:dict):

    """Use this tool when you need to answer questions about purchase order status 
    by searching the purchase order details and returning the results for the given query 
    by scraping the API call."""




    