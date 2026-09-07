import type { Item, StoreState, Work } from './types';
import { dataError } from './error';

type ApiResponse = { ok: boolean; data?: unknown; error?: { code?: string; message?: string } };
type ApiData = Pick<StoreState, 'works' | 'version' | 'shipping'>;
type ImportMetaWithEnv = ImportMeta & { env?: { VITE_MERCH_API_URL?: string } };
type AuthStatus = { authenticated: boolean };
type ApiFailure = { apiCode?: string; status: number };
type AssetResult = { path: string; replaced: boolean; version: string };
type AssetDeleteResult = { path: string; deleted: boolean; version: string };
type AssetCleanupResult = { deletedPaths?: string[]; count: number; version: string };
type WorkPayload = { id?: string; name: string; code: string };

const meta = import.meta as ImportMetaWithEnv;
const API_BASE = (meta.env?.VITE_MERCH_API_URL || '/api').replace(/\/$/, '');
const API_TIMEOUT_MS = 12_000;
const FORBIDDEN_STORAGE_FIELDS = ['workName', 'shipping', 'material', 'release', 'createdAt', 'updatedAt'] as const;
function endpoint(path: string): string { return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`; }
function authToken(): string { try { return sessionStorage.getItem('merch-admin-secret') || ''; } catch { return ''; } }
function toStorageItem(item: Item): Item { const copy = structuredClone(item) as Item & Record<string, unknown>; for (const field of FORBIDDEN_STORAGE_FIELDS) delete copy[field]; return copy; }
async function request(path: string, init: RequestInit = {}): Promise<unknown> { const headers = new Headers(init.headers); headers.set('Accept', 'application/json'); if (init.body) headers.set('Content-Type', 'application/json'); const token = authToken(); if (token) headers.set('Authorization', `Bearer ${token}`); const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS); let response: Response; try { response = await fetch(endpoint(path), { ...init, headers, cache: 'no-store', signal: controller.signal }); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw dataError('API 請求逾時，請稍後再試。'); throw dataError('API 網路連線失敗，請稍後再試。'); } finally { window.clearTimeout(timer); } let payload: ApiResponse | null = null; try { payload = await response.json() as ApiResponse; } catch {} if (!response.ok || !payload?.ok) { const failure: ApiFailure = { apiCode: payload?.error?.code, status: response.status }; throw dataError(payload?.error?.message || `API 請求失敗（${response.status}）`, failure); } return payload.data; }
function validateData(data: unknown): ApiData { if (!data || typeof data !== 'object') throw dataError('API 回傳資料格式無效。'); const value = data as Partial<ApiData>; if (!Array.isArray(value.works) || typeof value.version !== 'string') throw dataError('API 回傳資料格式無效。'); return { works: value.works as Work[], version: value.version, shipping: value.shipping as StoreState['shipping'] }; }
function validateAuthStatus(data: unknown): AuthStatus { if (!data || typeof data !== 'object' || typeof (data as { authenticated?: unknown }).authenticated !== 'boolean') throw dataError('API 驗證狀態格式無效。'); return data as AuthStatus; }
function validateAssetResult(data: unknown): AssetResult { if (!data || typeof data !== 'object') throw dataError('API 回傳圖片資料格式無效。'); const value = data as Partial<AssetResult>; if (typeof value.path !== 'string' || typeof value.replaced !== 'boolean' || typeof value.version !== 'string') throw dataError('API 回傳圖片資料格式無效。'); return value as AssetResult; }
function validateAssetDeleteResult(data: unknown): AssetDeleteResult { if (!data || typeof data !== 'object') throw dataError('API 回傳圖片刪除結果格式無效。'); const value = data as Partial<AssetDeleteResult>; if (typeof value.path !== 'string' || value.deleted !== true || typeof value.version !== 'string') throw dataError('API 回傳圖片刪除結果格式無效。'); return value as AssetDeleteResult; }
function validateAssetCleanupResult(data: unknown): AssetCleanupResult { if (!data || typeof data !== 'object') throw dataError('API 回傳圖片清理結果格式無效。'); const value = data as Partial<AssetCleanupResult>; if ((!Array.isArray(value.deletedPaths) && value.count !== 0) || (Array.isArray(value.deletedPaths) && value.deletedPaths.some(path => typeof path !== 'string')) || typeof value.count !== 'number' || !Number.isInteger(value.count) || value.count < 0 || typeof value.version !== 'string') throw dataError('API 回傳圖片清理結果格式無效。'); return value as AssetCleanupResult; }
export async function getRemoteData(): Promise<ApiData> { return validateData(await request('/data')); }
export async function putItem(item: Item): Promise<ApiData> { return validateData(await request(`/items/${encodeURIComponent(item.id)}`, { method: 'PUT', body: JSON.stringify({ item: toStorageItem(item) }) })); }
export async function deleteItem(id: string): Promise<ApiData> { return validateData(await request(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' })); }
export async function createWork(input: WorkPayload): Promise<ApiData> { return validateData(await request('/works', { method: 'POST', body: JSON.stringify({ work: input }) })); }
export async function updateWork(id: string, input: Omit<WorkPayload, 'id'>): Promise<ApiData> { return validateData(await request(`/works/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ work: input }) })); }
export async function deleteWork(id: string): Promise<ApiData> { return validateData(await request(`/works/${encodeURIComponent(id)}`, { method: 'DELETE' })); }
export async function getAsset(path: string): Promise<Blob> { const headers = new Headers({ Accept: 'image/*' }); const token = authToken(); if (token) headers.set('Authorization', `Bearer ${token}`); const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS); try { const response = await fetch(endpoint(`/assets/${path.split('/').map(encodeURIComponent).join('/')}`), { headers, cache: 'no-store', signal: controller.signal }); if (!response.ok) throw dataError(`圖片讀取失敗（${response.status}）。`); return await response.blob(); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw dataError('圖片請求逾時，請稍後再試。'); throw error; } finally { window.clearTimeout(timer); } }
export async function putAsset(path: string, content: string): Promise<AssetResult> { return validateAssetResult(await request(`/assets/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'PUT', body: JSON.stringify({ path, content }) })); }
export async function deleteAsset(path: string): Promise<AssetDeleteResult> { return validateAssetDeleteResult(await request(`/assets/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'DELETE' })); }
export async function cleanupAssets(): Promise<AssetCleanupResult> { return validateAssetCleanupResult(await request('/assets/cleanup', { method: 'POST' })); }
export async function getShipping(): Promise<StoreState['shipping']> { const data = await request('/shipping'); if (!Array.isArray(data)) throw dataError('API 回傳運費資料格式無效。'); return data as StoreState['shipping']; }
export async function putShipping(record: StoreState['shipping'][number]): Promise<ApiData> { return validateData(await request(`/shipping/${encodeURIComponent(record.id)}`, { method: 'PUT', body: JSON.stringify({ shipping: record }) })); }
export async function deleteShipping(id: string): Promise<ApiData> { return validateData(await request(`/shipping/${encodeURIComponent(id)}`, { method: 'DELETE' })); }
export async function getAuthStatus(): Promise<AuthStatus> { return validateAuthStatus(await request('/auth/status')); }
export function hasAdminSecret(): boolean { return Boolean(authToken()); }
export function setAdminSecret(value: string): void { try { if (value.trim()) sessionStorage.setItem('merch-admin-secret', value.trim()); else sessionStorage.removeItem('merch-admin-secret'); } catch { throw dataError('無法儲存管理驗證資訊。'); } }
export function clearAdminSecret(): void { try { sessionStorage.removeItem('merch-admin-secret'); } catch {} }
export function apiConfigured(): boolean { return Boolean(API_BASE); }
