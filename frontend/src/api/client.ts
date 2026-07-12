import type { UserProgress, ProgressUpdate, TemplateMetadata, CodeTemplate, Course, Lesson, DashboardData, Certificate, GithubActivity } from '../types';

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
  userId = 'demo-user',
): AsyncGenerator<void, void, unknown> {
  const res = await fetch(`${BASE}/mentor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context, user_id: userId }),
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

// ─── Authentication ───────────────────────────────────────────────────────────
export interface AuthConfig {
  github_client_id: string;
  github_redirect_uri: string;
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  const res = await fetch(`${BASE}/auth/config`);
  if (!res.ok) throw new Error(`Failed to fetch auth config: ${res.status}`);
  return res.json();
}

export async function authGithub(username?: string, code?: string): Promise<UserProgress> {
  const res = await fetch(`${BASE}/auth/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, code }),
  });
  if (!res.ok) throw new Error(`GitHub auth failed: ${res.status}`);
  return res.json();
}

export async function authWallet(
  address: string,
  message?: string,
  signature?: string,
): Promise<UserProgress> {
  const res = await fetch(`${BASE}/auth/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!res.ok) throw new Error(`Wallet auth failed: ${res.status}`);
  return res.json();
}

// ─── Courses & Lessons ────────────────────────────────────────────────────────
export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${BASE}/courses`);
  if (!res.ok) throw new Error(`Failed to fetch courses: ${res.status}`);
  return res.json();
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  const res = await fetch(`${BASE}/courses/lessons/${lessonId}`);
  if (!res.ok) throw new Error(`Failed to fetch lesson: ${res.status}`);
  return res.json();
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export interface QuizResult {
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  results: {
    question: string;
    user_answer_idx: number;
    correct_answer_idx: number;
    is_correct: boolean;
  }[];
  user_progress: UserProgress;
}

export async function postQuizSubmit(
  userId: string,
  lessonId: string,
  answers: number[],
): Promise<QuizResult> {
  const res = await fetch(`${BASE}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, lesson_id: lessonId, answers }),
  });
  if (!res.ok) throw new Error(`Quiz submission failed: ${res.status}`);
  return res.json();
}

export interface ExerciseResult {
  passed: boolean;
  feedback: string;
  missing_keywords: string[];
  user_progress: UserProgress;
}

export async function postExerciseSubmit(
  userId: string,
  lessonId: string,
  code: string,
): Promise<ExerciseResult> {
  const res = await fetch(`${BASE}/exercise/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, lesson_id: lessonId, code }),
  });
  if (!res.ok) throw new Error(`Exercise submission failed: ${res.status}`);
  return res.json();
}

// ─── Dashboard & Analytics ────────────────────────────────────────────────────
export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const res = await fetch(`${BASE}/dashboard/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.status}`);
  return res.json();
}

// ─── Certificates ─────────────────────────────────────────────────────────────
export async function fetchCertificates(userId: string): Promise<Certificate[]> {
  const res = await fetch(`${BASE}/certificates/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch certificates: ${res.status}`);
  return res.json();
}

// ─── GitHub Activity ──────────────────────────────────────────────────────────
export async function fetchGithubActivity(userId: string): Promise<GithubActivity[]> {
  const res = await fetch(`${BASE}/github/activity/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch GitHub activity: ${res.status}`);
  return res.json();
}
