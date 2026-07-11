// ─── API client helpers ───────────────────────────────────────────────────────
import type { UserProgress, ProgressUpdate, TemplateMetadata, CodeTemplate } from '../types';

const BASE = '/api';

// ─── Progress ─────────────────────────────────────────────────────────────────
export async function fetchProgress(userId = 'demo-user'): Promise<UserProgress> {
  const res = await fetch(`${BASE}/progress/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch progress: ${res.status}`);
  return res.json();
}

export async function postProgress(
  userId = 'demo-user',
  update: ProgressUpdate,
): Promise<UserProgress> {
  const res = await fetch(`${BASE}/progress/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`Failed to update progress: ${res.status}`);
  return res.json();
}

// ─── Templates ────────────────────────────────────────────────────────────────
export async function fetchTemplates(levelId?: number): Promise<TemplateMetadata[]> {
  const url = levelId != null
    ? `${BASE}/templates?level_id=${levelId}`
    : `${BASE}/templates`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);
  return res.json();
}

export async function fetchTemplate(id: string): Promise<CodeTemplate> {
  const res = await fetch(`${BASE}/templates/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
  return res.json();
}

// ─── AI Mentor (streaming) ────────────────────────────────────────────────────
export async function* streamMentorChat(
  prompt: string,
  context: string,
  onChunk: (delta: string) => void,
): AsyncGenerator<void, void, unknown> {
  const res = await fetch(`${BASE}/mentor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Mentor API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') return;
      try {
        const parsed = JSON.parse(raw) as { delta: string };
        onChunk(parsed.delta);
      } catch {
        // skip malformed chunks
      }
    }
    yield;
  }
}
