# Developer Academy MVP

A modular, full-stack Developer Academy web application.

## Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 19 + TypeScript + Vite  |
| Backend   | Python 3.12 + FastAPI         |
| AI        | Claude (Anthropic) / Hermes (OpenAI-compat) / Mock |
| Styling   | Vanilla CSS (design tokens)   |

---

## Project Structure

```
DeveloperAcademy/
├── src/                    # FastAPI backend
│   ├── main.py             # App entry + CORS + routers
│   ├── config.py           # Pydantic settings
│   ├── models/             # Pydantic schemas (active + future-proof)
│   ├── api/                # REST routers
│   └── services/           # AI Mentor service
├── frontend/               # React TypeScript frontend
│   └── src/
│       ├── components/     # Modular, exportable components
│       ├── pages/          # Thin page wrappers
│       ├── api/            # Type-safe API client
│       └── types/          # Shared TypeScript types
├── requirements.txt
└── .env.example
```

---

## Quick Start

### 1. Backend

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Edit .env if you have API keys (leave DEFAULT_LLM=mock for local dev)

# Start the API server
uvicorn src.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## API Endpoints

| Method | Route                         | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | `/health`                     | Health check                    |
| GET    | `/api/progress/{user_id}`     | Get user progress               |
| POST   | `/api/progress/{user_id}`     | Update lesson progress          |
| GET    | `/api/templates`              | List code templates             |
| GET    | `/api/templates/{id}`         | Get template with source code   |
| POST   | `/api/mentor/chat`            | Stream AI Mentor response (SSE) |

---

## LLM Configuration

Set `DEFAULT_LLM` in `.env`:

| Value    | Provider                        |
|----------|---------------------------------|
| `mock`   | Built-in mock (no keys needed)  |
| `claude` | Anthropic Claude API            |
| `hermes` | Hermes via OpenAI-compat REST   |

---

## Future Features (Data Schemas Ready)

The following are **not yet in the UI** but the backend schemas are defined:

- 📈 **Learning Analytics** — `src/models/analytics.py`
- 🏅 **Hackathon Tracking** — `src/models/hackathon.py`
- 💬 **Community Forum**  — `src/models/forum.py`

---

## Component Export Map

Components are designed for easy integration into a parent application:

```typescript
// Layout
import { Sidebar }       from './components/Layout/Sidebar';
import { Header }        from './components/Layout/Header';

// Features
import { RoadmapView }   from './components/Roadmap/RoadmapView';
import { Dashboard }     from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/AIMentor/ChatInterface';

// Primitives
import { ProgressBar }   from './components/Dashboard/ProgressBar';
import { CodeBlock }     from './components/AIMentor/CodeBlock';
import { ChatMessage }   from './components/AIMentor/ChatMessage';
```
