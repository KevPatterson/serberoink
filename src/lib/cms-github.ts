import 'server-only';

const GITHUB_API_BASE = 'https://api.github.com';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getGithubConfig() {
  return {
    token: getRequiredEnv('GITHUB_TOKEN'),
    owner: getRequiredEnv('GITHUB_OWNER'),
    repo: getRequiredEnv('GITHUB_REPO'),
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'serberoink-cms',
  };
}

function toBase64(content: string): string {
  return Buffer.from(content, 'utf8').toString('base64');
}

function normalizeBase64(base64: string): string {
  const index = base64.indexOf(',');
  return index >= 0 ? base64.slice(index + 1) : base64;
}

export function sanitizeFilename(filename: string): string {
  const clean = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  return clean.replace(/-+/g, '-');
}

async function githubFetch(path: string, init?: RequestInit): Promise<Response> {
  const { token } = getGithubConfig();
  return fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      ...getHeaders(token),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
}

export async function getRepoFileSha(path: string): Promise<string | null> {
  const { owner, repo, branch } = getGithubConfig();
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to read file SHA: ${res.status}`);
  }

  const data = (await res.json()) as { sha?: string };
  return data.sha || null;
}

export async function putRepoFile(params: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}): Promise<void> {
  const { owner, repo, branch } = getGithubConfig();

  const payload = {
    message: params.message,
    branch,
    content: toBase64(params.content),
    sha: params.sha,
  };

  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${params.path}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update file: ${res.status} ${text}`);
  }
}

export async function putRepoBase64File(params: {
  path: string;
  base64: string;
  message: string;
  sha?: string;
}): Promise<void> {
  const { owner, repo, branch } = getGithubConfig();

  const payload = {
    message: params.message,
    branch,
    content: normalizeBase64(params.base64),
    sha: params.sha,
  };

  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${params.path}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload file: ${res.status} ${text}`);
  }
}

export function buildRawGithubUrl(path: string): string {
  const { owner, repo, branch } = getGithubConfig();
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}
