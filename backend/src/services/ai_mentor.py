"""
AI Mentor Service — handles LLM requests via Vercel AI Mentor API (OpenClaw, Hermes) with SSE streaming.
Falls back to Claude/Hermes local or mock streamer if mentor API token is not set.
"""
import asyncio
import json
import time
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.config import settings
from src.models.mentor import MentorChatRequest
from src.constants.prompts import SYSTEM_TEMPLATE_OPENCLAW, SYSTEM_TEMPLATE_HERMES, MOCK_RESPONSES

router = APIRouter()


# ─── System prompt builder ────────────────────────────────────────────────────
def _build_system_prompt(provider: str, context: str) -> str:
    ctx = context if context else "General Developer Academy curriculum"
    if provider == "hermes":
        return SYSTEM_TEMPLATE_HERMES.format(context=ctx)
    else:
        return SYSTEM_TEMPLATE_OPENCLAW.format(context=ctx)


# ─── SSE helpers ─────────────────────────────────────────────────────────────
def _sse_chunk(text: str) -> str:
    payload = json.dumps({"delta": text})
    return f"data: {payload}\n\n"


def _sse_done() -> str:
    return "data: [DONE]\n\n"


# ─── Vercel AI Mentor Streamer ────────────────────────────────────────────────
async def _vercel_mentor_stream(prompt: str, context: str, mentor_id: str) -> AsyncGenerator[str, None]:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.mentor_bearer_token}",
    }

    full_message = f"[Context: {context}]\n{prompt}" if context else prompt

    payload = {
        "mentorId": mentor_id,
        "message": full_message,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                settings.mentor_api_url,
                headers=headers,
                json=payload,
            )
            if resp.status_code == 200:
                data = resp.json()
                reply_text = data.get("reply", "") or data.get("message", "") or "No response from mentor."
                words = reply_text.split(" ")
                for i, word in enumerate(words):
                    chunk = word + (" " if i < len(words) - 1 else "")
                    yield _sse_chunk(chunk)
                    await asyncio.sleep(0.015)
            else:
                yield _sse_chunk(f"\n\n[Error from Mentor API ({resp.status_code}): {resp.text}]")
        yield _sse_done()
    except Exception as exc:
        yield _sse_chunk(f"\n\n[Error calling Mentor API: {exc}]")
        yield _sse_done()


async def _mock_stream(prompt: str) -> AsyncGenerator[str, None]:
    response = MOCK_RESPONSES["default"]
    words = response.split(" ")
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield _sse_chunk(chunk)
        await asyncio.sleep(0.03)  # simulate streaming delay
    yield _sse_done()


# ─── Claude streamer ──────────────────────────────────────────────────────────
async def _claude_stream(prompt: str, system: str) -> AsyncGenerator[str, None]:
    try:
        import anthropic  # lazy import — only needed if Claude is active

        client = anthropic.AsyncAnthropic(api_key=settings.claude_api_key)
        async with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield _sse_chunk(text)
        yield _sse_done()
    except Exception as exc:
        yield _sse_chunk(f"\n\n[Error from OpenClaw: {exc}]")
        yield _sse_done()


# ─── Hermes streamer (OpenAI-compatible) ──────────────────────────────────────
async def _hermes_stream(prompt: str, system: str) -> AsyncGenerator[str, None]:
    payload = {
        "model": settings.hermes_model,
        "stream": True,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                f"{settings.hermes_api_url}/chat/completions",
                json=payload,
            ) as resp:
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    raw = line[5:].strip()
                    if raw == "[DONE]":
                        break
                    try:
                        chunk = json.loads(raw)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield _sse_chunk(delta)
                    except (json.JSONDecodeError, KeyError):
                        continue
        yield _sse_done()
    except Exception as exc:
        yield _sse_chunk(f"\n\n[Error from Hermes: {exc}]")
        yield _sse_done()


# ─── Router ───────────────────────────────────────────────────────────────────
@router.post("/chat")
async def mentor_chat(req: MentorChatRequest):
    """
    Stream an AI Mentor response via Server-Sent Events.

    The client should consume this as an EventSource or ReadableStream.
    Each SSE event carries a JSON payload: { "delta": "<text chunk>" }
    A final event carries: [DONE]
    """
    # Log chat session to MongoDB
    from src.services.db import log_mentor_chat
    session_id = f"session-{req.context[:15].strip().lower().replace(' ', '-') or 'default'}"
    try:
        await log_mentor_chat(req.user_id, session_id)
    except Exception as e:
        print(f"Error logging chat session to DB: {e}")

    provider = (req.provider or settings.default_llm).lower()

    if provider == "hermes":
        mentor_id = "hermes"
    else:
        mentor_id = "openclaw"

    if settings.mentor_bearer_token:
        gen = _vercel_mentor_stream(req.prompt, req.context, mentor_id)
    elif provider in ["claude"]:
        system = _build_system_prompt(provider, req.context)
        gen = _claude_stream(req.prompt, system)
    elif provider == "hermes" and settings.hermes_api_url:
        system = _build_system_prompt(provider, req.context)
        gen = _hermes_stream(req.prompt, system)
    else:
        gen = _mock_stream(req.prompt)

    return StreamingResponse(
        gen,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable Nginx buffering if proxied
        },
    )
