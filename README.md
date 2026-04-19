# 🚀 Oracle Fusion PO Dashboard — Conversational AI

An AI-powered conversational dashboard for querying Oracle Fusion Purchase Order data. Ask natural language questions and get structured, intelligent answers backed by live Oracle Fusion REST APIs.

---

## 📽️ Demo

<video controls src="20260418-0844-59.7462742.mp4" title="Title"></video>

---

## Project Structure

```
dashboard_po/
├── frontend/        # React + Vite + TypeScript + TailwindCSS v4
└── backend/         # Python FastAPI backend with LangChain AI agents
```

---

## Features

-  **Conversational Interface** — Chat-style UI to query PO data in plain English
-  **LangChain AI Agents** — Parallel LLM runnables for tool selection & parameter extraction
-  **Oracle Fusion REST APIs** — Live data fetched directly from Oracle Fusion environment
-  **Thread Management** — Persistent chat threads (max 10, pruned after 15 days)
-  **Daily Usage Limit** — 10 queries/day per user, tracked in localStorage
-  **Markdown Rendering** — AI responses rendered with full Markdown + GFM support
-  **Dark Theme UI** — Sleek dark-mode design with smooth animations
- 🔄 **Real-time Status** — Server health & remaining request count in the header

---

## Frontend

### Tech Stack

| Technology | Version |
|---|---|
| React | 19 |
| TypeScript | ~5.8 |
| Vite | 6 |
| TailwindCSS | 4 |
| react-markdown | 10 |
| lucide-react | latest |
| motion | 12 |

### Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and set VITE_BACKEND_URL to your backend URL

# Start development server (runs on port 3000)
npm run dev
```

### Environment Variables

Create a `.env` file inside `frontend/` based on `.env.example`:

```env
# URL of the backend API server
VITE_BACKEND_URL=http://localhost:8000
```

> Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## Backend

### Tech Stack

| Technology | Version |
|---|---|
| Python | ≥ 3.11 |
| FastAPI | ≥ 0.136 |
| Uvicorn | ≥ 0.44 |
| LangChain | ≥ 1.2 |
| LangChain-OpenAI | ≥ 1.1 |
| OpenAI | via langchain-openai |
| httpx | ≥ 0.28 |
| pandas | ≥ 3.0 |
| uv | (package manager) |

### Setup & Run

```bash
cd backend

# Install uv (if not already installed)
pip install uv

# Create virtual environment and install dependencies
uv sync

# Create your environment file
cp .env.example .env
# Edit .env and fill in all required values

# Start the FastAPI server (runs on port 8000)
uv run uvicorn api:app --reload --port 8000
```

### Environment Variables

Create a `.env` file inside `backend/` based on `.env.example`:

```env
# OpenAI API Key — used by LangChain to call GPT models
OPENAI_API_KEY=your_openai_api_key_here

# Oracle Fusion credentials
USERNAME=your_oracle_fusion_username
PASSWORD=your_oracle_fusion_password

# Oracle Fusion base URL
BASE_URL=https://your-oracle-instance.fa.ocs.oraclecloud.com



> Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Welcome message |
| `GET` | `/api/health` | Health check | - Keeping the server awake
| `POST` | `/api/query` | Submit a natural language PO query |

### POST `/api/query`

**Request Body:**
```json
{
  "query": "Show me all open purchase orders for this month"
}
```

**Response:**
```json
{
  "response": "Here is a summary of open purchase orders for April 2026..."
}
```

---

## Security Notes

- All secrets (API keys, credentials) are stored in `.env` files — never hardcoded
- Both `frontend/.env` and `backend/.env` are excluded from git via `.gitignore`
- `.env.example` files are provided as safe templates with placeholder values

---

## Deployment

### Backend (e.g., Render / Railway)

1. Set all environment variables from `backend/.env.example` in your hosting platform's dashboard
2. Set the start command to: `uvicorn api:app --host 0.0.0.0 --port 8000`

### Frontend (e.g., Vercel / Netlify)

1. Set `VITE_BACKEND_URL` to your deployed backend URL in the platform's environment settings
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is for internal use. Please contact the repository owner for licensing details.
