"""
Developer Academy — FastAPI Backend Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.api import progress, templates
from src.services.ai_mentor import router as mentor_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    print(f"🚀  Developer Academy API starting — env={settings.app_env}")
    yield
    print("🛑  Developer Academy API shutting down")


app = FastAPI(
    title="Developer Academy API",
    version="0.1.0",
    description="Modular backend for the Developer Academy — AI Mentor, Progress Tracking, Code Templates.",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(mentor_router, prefix="/api/mentor", tags=["AI Mentor"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
