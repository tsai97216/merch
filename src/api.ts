import type { Item, StoreState, Work } from './types';
import { dataError } from './error';

type ApiResponse = {
  ok: boolean;
  data?: unknown;
  error?: { code?: string; message?: string };
};

type ApiData = Pick<StoreState, 'works' | 'version'>;

const API_BASE = (import.meta.env.VITE_MERCH_API_URL || '').replace(/\/$/, '');
const ADMIN_SECRET = import.meta.env.VITE_MERCH_ADMIN_SECRET || '';

function endpoint(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (ADMIN_SECRET) headers.set('Authorization', `Bearer ${ADMIN_SECRET}`);

  let response: Response;
  try {
    response = await fetch(endpoint(path), { ...init, headers, cache: 'no-store' });
  } catch {
    throw dataError('API 網路連線失敗，請稍後再試。');
  }

  let payload: ApiResponse | null = null;
  try { payload = await response.json() as ApiResponse; } catch { /* handled below */ }
  if (!response.ok || !payload?.ok) {
    throw dataError(payload?.error?.message || `API 請求失敗（${response.status}）`);
  }
  return payload.data;
}

export async function getRemoteData(): Promise<ApiData> {
  const data = await request('/api/data') as Partial<ApiData>;
  if (!Array.isArray(data.works) || typeof data.version !== 'string') throw dataError('API 回傳資料格式無效。');
  return { works: data.works as Work[], version: data.version };
}

export async function putItem(item: Item): Promise<ApiData> {
  const data = await request(`/api/items/${encodeURIComponent(item.id)}`, { method: 'PUT', body: JSON.stringify({ item }) }) as Partial<ApiData>;
  if (!Array.isArray(data.works) || typeof data.version !== 'string') throw dataError('API 回傳資料格式無效。');
  return { works: data.works as Work[], version: data.version };
}

export async function deleteItem(id: string): Promise<ApiData> {
  const data = await request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' }) as Partial<ApiData>;
  if (!Array.isArray(data.works) || typeof data.version !== 'string') throw dataError('API 回傳資料格式無效。');
  return { works: data.works as Work[], version: data.version };
}

export function apiConfigured(): boolean {
  return Boolean(API_BASE);
}
