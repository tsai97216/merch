import type { Item, StoreState, Work } from './types';
import { dataError } from './error';

type ApiResponse = { ok: boolean; data?: unknown; error?: { code?: string; message?: string } };
type ApiData = Pick<StoreState, 'works' | 'version'>;
type ImportMetaWithEnv = ImportMeta & { env?: { VITE_MERCH_API_URL?: string } };

const meta = import.meta as ImportMetaWithEnv;
const API_BASE = (meta.env?.VITE_MERCH_API_URL || '/api').replace(/\/$/, '');
const API_TIMEOUT_MS = 12_000;

function endpoint(path: string): string { return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`; }
function authToken(): string { try { return sessionStorage.getItem('merch-admin-secret') || ''; } catch { return ''; } }

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  const token = authToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(endpoint(path), { ...init, headers, cache: 'no-store', signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw dataError('API 請求逾時，請稍後再試。');
    throw dataError('API 網路連線失敗，請稍後再試。');
  } finally {
    window.clearTimeout(timer);
  }
  let payload: ApiResponse | null = null;
  try { payload = await response.json() as ApiResponse; } catch { /* handled below */ }
  if (!response.ok || !payload?.ok) throw dataError(payload?.error?.message || `API 請求失敗（${response.status}）`);
  return payload.data;
}

function validateData(data: unknown): ApiData {
  if (!data || typeof data !== 'object') throw dataError('API 回傳資料格式無效。');
  const value = data as Partial<ApiData>;
  if (!Array.isArray(value.works) || typeof value.version !== 'string') throw dataError('API 回傳資料格式無效。');
  return { works: value.works as Work[], version: value.version };
}

export async function getRemoteData(): Promise<ApiData> { return validateData(await request('/data')); }
export async function putItem(item: Item): Promise<ApiData> { return validateData(await request(`/items/${encodeURIComponent(item.id)}`, { method: 'PUT', body: JSON.stringify({ item }) })); }
export async function deleteItem(id: string): Promise<ApiData> { return validateData(await request(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' })); }
export function hasAdminSecret(): boolean { return Boolean(authToken()); }
export function setAdminSecret(value: string): void { try { if (value.trim()) sessionStorage.setItem('merch-admin-secret', value.trim()); else sessionStorage.removeItem('merch-admin-secret'); } catch { throw dataError('無法儲存管理驗證資訊。'); } }
export function clearAdminSecret(): void { try { sessionStorage.removeItem('merch-admin-secret'); } catch { /* optional */ } }
export function apiConfigured(): boolean { return Boolean(API_BASE); }
