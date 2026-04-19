import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv
import httpx

#loading env values
load_dotenv(override=True)

#username & password & url for fusion api call
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")
BASE_URL = os.getenv("BASE_URL")

#Purchase order fusion api call
async def get_po_fusion_api_call(query_string, llm_result):

    # url for purchase order fusion api call
    url = f"{BASE_URL}/fscmRestApi/resources/11.13.18.05/purchaseOrders"

    # authentication for purchase order fusion api call
    auth = HTTPBasicAuth(USERNAME,PASSWORD)

    # parameters for purchase order fusion api call
    params = {
        "q": None if len(query_string)==0 else query_string,
        "fields": "OrderNumber,Status,Buyer,Supplier,SupplierSite,Ordered,TotalTax,Total,RequisitioningBU,CurrencyCode,CreationDate,ShipToLocationCode",
        "onlyData":"true",
        "limit": 10 if llm_result["limit"] == None else llm_result["limit"],
        "orderBy":"CreationDate:desc"
    }

    #api call using try except block
    try:
        #using httpx for parallel api call to happen
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url, auth=auth, params=params)
    
        #raise an exception if the response status is 4xx, 5xx
        response.raise_for_status()

        #try to parse the response as JSON
        try:
            data = response.json()

            #return if response is successful
            return {
                "success": True,
                "data": data
            }
        
        #except block for invalid JSON response
        except Exception as e:
            return{
                "sucess": "False",
                "error": f"Invalid JSON response from API: {str(e)}"
            }
    
    #except block for HTTPError
    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP Error {response.status_code}: {response.text}",
        }
    
    #except block for Timeout
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Request timed out"
        }
    
    #except block for ConnectionError
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "error": "Connection failed (check network or URL)"
        }
    
    #except block for RequestException
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Request error: {str(e)}"
        }
    
    #except block for any other exceptions
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
