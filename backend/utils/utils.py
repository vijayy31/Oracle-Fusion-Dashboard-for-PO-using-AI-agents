def is_purchase_order(query:str)->bool:

    query = query.lower()

    keywords= ["po", "po#", "order", "order#", "purchase order","purchase orders", "purchase order#"]

    return any(kword in query for kword in keywords)

def valid_query_check(user_query, llm_result):

    is_po = is_purchase_order(user_query)

    is_params=False

    for key in llm_result:
        if llm_result[key] != None:
            is_params = True
    
    return is_po or is_params


def date_formatter(dt_str:str)->str:
    from datetime import datetime, timedelta
    
    result_string = "CreationDate>="+dt_str+";"
    
    add_1_day = datetime.strptime(dt_str, "%Y-%m-%d") + timedelta(days=1)

    to_string = add_1_day.strftime("%Y-%m-%d")

    result_string +="CreationDate<="+to_string+";"

    return result_string

def create_query_string(llm_result):
    
    available_fields = {
    'OrderNumber': 'OrderNumber=',
    'Status': 'StatusCode=',
    'Supplier': 'Supplier=',
    'Buyer': 'BuyerDisplayName=',
    'CreationDateON': '',
    'CreationDateFrom': 'CreationDate>=',
    'CreationDateTo': 'CreationDate<=',
    'AmountFrom': None,
    'AmountTo': None,
    'limit': None}

    query_string=""

    for key in llm_result:

        if key == "limit" or key=="AmountFrom" or key=="AmountTo" or key=="CreationDateON":
            continue
        
        if key == "CreationDateON":
            query_string += date_formatter(llm_result[key])

        if key=="Status" and llm_result["OrderNumber"]==None:
            query_string+="StatusCode!=CLOSED;"
        
        if llm_result[key] != None:
            query_string +=str(available_fields[key])+str(llm_result[key])+";"

    return query_string


def result_parser(response):
    import pandas as pd

    if response.get("success"):

        items = response.get("data").get("items")

        if len(items)==0:

            return{
                "success": False,
                "data": "The output from the API is empty, Please search with correct data"
            }

        # df = pd.DataFrame(items)

        # df["CreationDate"] = pd.to_datetime(df["CreationDate"])

        return {
            "success":True,
            "data":items
        }

def result_parsing(tools, api_result):
    # from mappers.final_result_mappers import result_mapper
    result_mapper={
    'get_purchase_orders':"Purchase_order_details"
    }
    final_result = {}

    for tool in tools:
        tool_data = api_result.get(tool.__name__)
        final_result[result_mapper.get(tool.__name__)]= result_parser(tool_data)
    
    return final_result
       

