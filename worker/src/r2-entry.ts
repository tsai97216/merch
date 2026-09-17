import app from './index';
import { deleteR2Asset, getR2Asset, putR2Asset } from './r2-assets';

interface Env {
  ALLOWED_ORIGIN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  ADMIN_SECRET: string;
  MERCH_ASSETS: R2Bucket;
}

type AssetRequest = { path?: unknown; content?: unknown };

const WORKER_VERSION = '1.109.832';
const ASSET_RE = /^data\/[^/]+\/[a-z]\/[^/]+\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;

function assetContentType(path: string): string {
  const ext = path.toLowerCase().split('.').pop();
  return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : 'image/jpeg';
}

function corsResponse(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('X-Merch-Worker-Version', WORKER_VERSION);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function getR2AssetResponse(env: Env, request: Request, origin: string, path: string): Promise<Response> {
  const asset = await getR2Asset(env.MERCH_ASSETS, path);
  if (!asset?.body) return corsResponse(new Response('Not Found', { status: 404 }), origin);
  const headers = new Headers({
    'Content-Type': asset.httpMetadata?.contentType || assetContentType(path),
    'Cache-Control': asset.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'X-Merch-Asset-Source': 'r2',
    'X-Merch-Worker-Version': WORKER_VERSION,
  });
  if (asset.etag) headers.set('ETag', asset.etag);
  if (request.headers.get('If-None-Match') && asset.etag && request.headers.get('If-None-Match') === asset.etag) return new Response(null, { status: 304, headers });
  return new Response(asset.body, { status: 200, headers });
}

function assetPath(request: Request): string | null {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/assets/')) return null;
  let path: string;
  try { path = decodeURIComponent(url.pathname.slice('/api/assets/'.length)); } catch { return null; }
  return ASSET_RE.test(path) && !path.includes('..') ? path : null;
}

async function handleAsset(env: Env, request: Request, origin: string): Promise<Response | null> {
  const path = assetPath(request);
  if (!path) return null;
  if (request.method === 'GET' || request.method === 'HEAD') return getR2AssetResponse(env, request, origin, path);
  return null;
}

async function putAsset(env: Env, request: Request, origin: string): Promise<Response> {
  const body = await request.json() as AssetRequest;
  if (typeof body.path !== 'string' || typeof body.content !== 'string') return corsResponse(new Response(JSON.stringify({ ok: false, error: { code: 'ASSET_INPUT_INVALID', message: '圖片資料格式無效。' } }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }), origin);
  const result = await putR2Asset(env.MERCH_ASSETS, body.path, body.content);
  return corsResponse(new Response(JSON.stringify({ ok: true, data: result }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } }), origin);
}

async function deleteAsset(env: Env, request: Request, origin: string): Promise<Response> {
  const body = await request.json() as AssetRequest;
  if (typeof body.path !== 'string') return corsResponse(new Response(JSON.stringify({ ok: false, error: { code: 'ASSET_INPUT_INVALID', message: '圖片路徑格式無效。' } }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }), origin);
  await deleteR2Asset(env.MERCH_ASSETS, body.path);
  return corsResponse(new Response(JSON.stringify({ ok: true, data: { deleted: true } }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } }), origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN;
    if (request.method === 'OPTIONS') return corsResponse(new Response(null, { status: 204 }), origin);
    const assetResponse = await handleAsset(env, request, origin);
    if (assetResponse) return assetResponse;
    const response = await app.fetch(request, env);
    return corsResponse(response, origin);
  },
};
