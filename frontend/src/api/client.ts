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

export interface GitHubSyncResult {
  user_progress: UserProgress;
  new_commits_count: number;
  total_commits_count: number;
  xp_gained: number;
}

export async function postGithubSync(userId: string, githubUsername: string): Promise<GitHubSyncResult> {
  const res = await fetch(`${BASE}/github/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, github_username: githubUsername }),
  });
  if (!res.ok) throw new Error(`GitHub sync failed: ${res.status}`);
  return res.json();
}

// ─── Forum API Calls ──────────────────────────────────────────────────────────
import type { ForumThread, ForumComment, Hackathon } from '../types';

export async function fetchForumThreads(category?: string, search?: string): Promise<ForumThread[]> {
  let url = `${BASE}/forum/threads`;
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  const queryStr = params.toString();
  if (queryStr) url += `?${queryStr}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch forum threads: ${res.status}`);
  return res.json();
}

export async function fetchForumThread(threadId: string): Promise<ForumThread> {
  const res = await fetch(`${BASE}/forum/threads/${threadId}`);
  if (!res.ok) throw new Error(`Failed to fetch thread: ${res.status}`);
  return res.json();
}

export async function postForumThread(
  title: string,
  author: string,
  category: string,
  content: string,
  tags: string[]
): Promise<ForumThread> {
  const res = await fetch(`${BASE}/forum/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, category, content, tags }),
  });
  if (!res.ok) throw new Error(`Failed to create thread: ${res.status}`);
  return res.json();
}

export async function postForumComment(
  threadId: string,
  author: string,
  content: string
): Promise<ForumComment> {
  const res = await fetch(`${BASE}/forum/threads/${threadId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, content }),
  });
  if (!res.ok) throw new Error(`Failed to create comment: ${res.status}`);
  return res.json();
}

// ─── Hackathons API Calls ──────────────────────────────────────────────────────
export async function fetchHackathons(userId?: string): Promise<Hackathon[]> {
  let url = `${BASE}/hackathons`;
  if (userId) url += `?user_id=${userId}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch hackathons: ${res.status}`);
  return res.json();
}

export async function postHackathonRegister(hackathonId: string, userId: string): Promise<UserProgress> {
  const res = await fetch(`${BASE}/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(`Failed to register for hackathon: ${res.status}`);
  return res.json();
}

export async function postHackathonSubmit(
  hackathonId: string,
  userId: string,
  projectName: string,
  tagline: string,
  description: string,
  videoLink: string,
  codeLink: string,
  teamSize: number
): Promise<UserProgress> {
  const res = await fetch(`${BASE}/hackathons/${hackathonId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      project_name: projectName,
      tagline,
      description,
      video_link: videoLink,
      code_link: codeLink,
      team_size: teamSize
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit project: ${res.status}`);
  return res.json();
}


