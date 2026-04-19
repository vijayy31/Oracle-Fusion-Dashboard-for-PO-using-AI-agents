from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main_call import main_function
from llm_call.llm_calls import final_output_generation

app = FastAPI(title="Dashboard PO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Dashboard PO API."}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/query", response_model=QueryResponse)
async def process_query(req: QueryRequest):
    try:
        # 1. Fetch raw data using the main logic
        raw_response = await main_function(req.query)
        
        # 2. Pass it to the final output generator to get a summarized string
        final_summary = await final_output_generation(raw_response)
        
        return QueryResponse(response=final_summary)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

