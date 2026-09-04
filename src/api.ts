const API_BASE = 'https://chi-merch-api.tsai97216.workers.dev';

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function workerGet<T>(path: string): Promise<T> {
  return fetchJson<T>(path);
}

export async function workerWrite<T>(
  path: string,
  method: 'PUT' | 'DELETE',
  body?: unknown,
  adminSecret?: string,
): Promise<T> {
  return fetchJson<T>(path, {
    method,
    headers: {
      ...(adminSecret ? { Authorization: `Bearer ${adminSecret}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
