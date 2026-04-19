# Oracle Fusion PO Dashboard — Backend

Python FastAPI backend that powers the Oracle Fusion PO Dashboard. It accepts plain-English queries from the frontend, uses parallel LangChain agents to extract intent & pick tools, then fetches live data from the Oracle Fusion REST API and returns an AI-formatted summary.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Python | ≥ 3.11 | Runtime |
| FastAPI | ≥ 0.136 | REST API framework |
| Uvicorn | ≥ 0.44 | ASGI server |
| LangChain | ≥ 1.2 | Agent orchestration |
| LangChain-OpenAI | ≥ 1.1 | OpenAI model integration |
| OpenAI GPT | `gpt-5.4-nano` | LLM for extraction & summarization |
| httpx | ≥ 0.28 | Async HTTP client (Oracle API calls) |
| pandas | ≥ 3.0 | Data manipulation |
| python-dotenv | latest | Environment variable management |
| uv | latest | Fast Python package manager |

---

## Project Structure

```
backend/
├── api.py                  # FastAPI app — entry point, routes, CORS
├── main_call.py            # Core orchestration logic
├── main_test.py            # Quick local test runner (no server needed)
│
├── llm_call/
│   └── llm_calls.py        # LLM setup (OpenAI), parallel runnables, final output generation
│
├── tool_calls/
│   └── tool_calls.py       # LangChain @tool definition for PO queries
│
├── functions/
│   └── tool_functions.py   # Async function: builds query string → calls Oracle API
│
├── api_calls/
│   └── api_calls.py        # Async Oracle Fusion REST API call with error handling
│
├── mappers/
│   ├── tool_mappers.py     # Maps LLM tool names → actual Python functions
│   └── final_result_mappers.py  # Maps function names → result keys
│
├── utils/
│   └── utils.py            # Query string builder, date formatter, result parser, validation
│
├── schema/
│   └── pydantic_schema.py  # Pydantic schema: PurchaseOrderFilters (LLM structured output)
│
├── prompts/
│   └── prompts.py          # System prompts for param extraction & final summarization
│
├── pyproject.toml          # Project dependencies (managed by uv)
├── .env                    # Secrets — NOT committed to git
├── .env.example            # Safe template — committed to git
└── .gitignore
```

---

## How It Works

```
User Query (from frontend)
        │
        ▼
  POST /api/query
        │
        ▼
  main_call.py — parallel_llm_runnable
  ┌─────────────────────────────────────────────┐
  │  params_generation()    tool_call_generation()  
  │  → extract filters      → pick LangChain tool   
  │    (structured output     (tool_get_purchase     
  │     via Pydantic)          _orders)              
  └─────────────────────────────────────────────┘
        │
        ▼
  tool_picker() — maps LLM tool name → get_purchase_orders()
        │
        ▼
  get_purchase_orders()
  → create_query_string()  — builds Oracle REST filter (q= param)
  → get_po_fusion_api_call() — async call to Oracle Fusion API
        │
        ▼
  result_parsing() — normalises API response
        │
        ▼
  final_output_generation() — GPT formats the raw data into Markdown summary
        │
        ▼
  Response sent back to frontend
```

---

## Setup & Run

### Prerequisites

- Python ≥ 3.11
- [`uv`](https://github.com/astral-sh/uv) package manager

```bash
# Install uv (if not already installed)
pip install uv
```

### Install & Start

```bash
cd backend

# Install all dependencies into a virtual environment
uv sync

# Copy the env template and fill in your values
cp .env.example .env

# Start the development server (auto-reloads on file change)
uv run uvicorn api:app --reload --port 8000
```

Server runs at: **http://localhost:8000**

### Quick Test (no server needed)

```bash
uv run python main_test.py
```

Edit the `user_query` inside `main_test.py` to try different queries directly from the terminal.

---

## Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```env
# OpenAI API Key — used by LangChain for GPT calls
OPENAI_API_KEY=sk-...

# Oracle Fusion login credentials
USERNAME=your.email@company.com
PASSWORD=YourOraclePassword

# Oracle Fusion Cloud base URL (your instance)
BASE_URL=your_base_url


```

> **Never commit `.env` to git.** It is already listed in `.gitignore`.

---

## API Endpoints

### `GET /`
Health welcome check.

**Response:**
```json
{ "message": "Welcome to the Dashboard PO API." }
```

---

### `GET /api/health`
Lightweight health ping — use this to keep the server warm (e.g. cron pings from frontend).

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /api/query`
Main endpoint — accepts a natural language PO query, returns a formatted AI summary.

**Request Body:**
```json
{
  "query": "Show me the top 5 open purchase orders this month"
}
```

**Success Response:**
```json
{
  "response": "Here are the 5 most recent open purchase orders for April 2026:\n\n| PO # | Supplier | Status | Total | ... |"
}
```

**Error Response:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Supported Query Filters

The LLM extracts and maps these filters from natural language:

| Filter | Oracle API Field | Example Query |
|---|---|---|
| PO Number | `OrderNumber` | "Show PO# 3800797941" |
| Status | `StatusCode` | "Show all approved POs" |
| Supplier | `Supplier` | "POs from Accenture" |
| Buyer | `BuyerDisplayName` | "POs raised by John" |
| Creation Date (exact) | `CreationDate>=` / `CreationDate<=` | "POs created on 2026-04-01" |
| Creation Date (range) | `CreationDate>=` + `CreationDate<=` | "POs from Jan to March" |
| Limit | `limit` param | "Show me 5 POs" / "recent" → 10 |

> When no status filter is provided and no PO number is given, `StatusCode!=CLOSED` is automatically applied to exclude closed orders.

---

## CORS Configuration

The backend allows requests from the following origins (configured in `api.py`):

```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

When deploying to production, update this list to include your frontend's deployed domain.

---

## Dependencies (`pyproject.toml`)

```toml
[project]
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.136.0",
    "uvicorn>=0.44.0",
    "langchain>=1.2.15",
    "langchain-core>=1.2.31",
    "langchain-openai>=1.1.14",
    "httpx>=0.28.1",
    "pandas>=3.0.2",
    "requests>=2.33.1",
    "python-dotenv",
]
```

---

## Deployment (e.g. Render / Railway)

1. Set all environment variables from `.env.example` in your hosting platform's dashboard
2. Set the **start command** to:
   ```
   uvicorn api:app --host 0.0.0.0 --port 8000
   ```
3. Update the CORS `allow_origins` in `api.py` to include your production frontend URL
4. Update `VITE_BACKEND_URL` in the frontend `.env` (or hosting platform) to point to this deployed URL

---

See the [root README](../README.md) for full project documentation including frontend setup.
