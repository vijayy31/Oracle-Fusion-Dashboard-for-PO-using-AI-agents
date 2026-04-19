async def get_purchase_orders(llm_result:dict):

    from utils.utils import create_query_string
    from api_calls.api_calls import get_po_fusion_api_call
    
    query_string = create_query_string(llm_result)
    
    response = await get_po_fusion_api_call(query_string, llm_result)
    
    return response