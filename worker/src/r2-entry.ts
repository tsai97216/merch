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

const WORKER_VERSION = '1.109.616';
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

function originFor(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  return !origin || origin === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : null;
}

function r2AssetPath(request: Request): string | null {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/assets/')) return null;
  const path = decodeURIComponent(url.pathname.slice('/api/assets/'.length));
  return ASSET_RE.test(path) && !path.includes('..') ? path : null;
}

async function getFromR2(env: Env, origin: string, path: string): Promise<Response | null> {
  const asset = await getR2Asset(env.MERCH_ASSETS, path);
  if (!asset?.body) return null;
  const headers = new Headers({
    'Content-Type': asset.httpMetadata?.contentType || assetContentType(path),
    'Cache-Control': asset.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'X-Merch-Asset-Source': 'r2',
    'X-Merch-Worker-Version': WORKER_VERSION,
  });
  if (asset.etag) headers.set('ETag', asset.etag);
  return new Response(asset.body, { status: 200, headers });
}

async function readAssetRequest(request: Request, path: string): Promise<Uint8Array> {
  const body = await request.clone().json() as AssetRequest;
  if (body.path !== path || typeof body.content !== 'string' || !body.content) throw new Error('圖片資料格式無效。');
  const binary = atob(body.content.replace(/\s/g, ''));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function readCurrentAssetFromGitHub(request: Request, env: Env): Promise<Uint8Array | null> {
  const fallbackRequest = new Request(request.url, { method: 'GET', headers: request.headers });
  const response = await app.fetch(fallbackRequest, env);
  if (!response.ok) return null;
  return new Uint8Array(await response.arrayBuffer());
}

async function mirrorPut(request: Request, env: Env, path: string): Promise<Response> {
  let bytes: Uint8Array;
  try {
    bytes = await readAssetRequest(request, path);
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: { code: 'ASSET_INVALID', message: error instanceof Error ? error.message : '圖片資料格式無效。' } }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }

  const previous = await readCurrentAssetFromGitHub(request, env);

  try {
    await putR2Asset(env.MERCH_ASSETS, path, bytes, assetContentType(path));
    const stored = await env.MERCH_ASSETS.head(path);
    if (!stored || stored.size !== bytes.byteLength) throw new Error(`R2 mirror verification failed for ${path}.`);
  } catch (error) {
    console.error('R2 image mirror PUT failed before GitHub mutation.', error);
    return new Response(JSON.stringify({ ok: false, error: { code: 'R2_MIRROR_FAILED', message: '圖片已壓縮，但 R2 儲存失敗，尚未寫入 GitHub。' } }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }

  let response: Response;
  try {
    response = await app.fetch(request, env);
  } catch (error) {
    try {
      if (previous) await putR2Asset(env.MERCH_ASSETS, path, previous, assetContentType(path));
      else await deleteR2Asset(env.MERCH_ASSETS, path);
    } catch (rollbackError) {
      console.error('R2 image mirror rollback failed after GitHub request error.', rollbackError);
    }
    throw error;
  }

  if (!response.ok) {
    try {
      if (previous) await putR2Asset(env.MERCH_ASSETS, path, previous, assetContentType(path));
      else await deleteR2Asset(env.MERCH_ASSETS, path);
    } catch (rollbackError) {
      console.error('R2 image mirror rollback failed after GitHub mutation failure.', rollbackError);
    }
  }

  return response;
}

async function mirrorDelete(env: Env, response: Response, path: string): Promise<Response> {
  if (!response.ok) return response;
  try {
    await deleteR2Asset(env.MERCH_ASSETS, path);
  } catch (error) {
    console.error('R2 image mirror DELETE failed; metadata remains authoritative.', error);
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = originFor(request, env);
    if (!origin) return new Response(JSON.stringify({ ok: false, error: { code: 'ORIGIN_NOT_ALLOWED', message: '來源網域不被允許。' } }), { status: 403, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Merch-Worker-Version': WORKER_VERSION } });

    const path = r2AssetPath(request);
    if (path && request.method === 'GET') {
      const r2Response = await getFromR2(env, origin, path);
      if (r2Response) return r2Response;
    }

    if (path && request.method === 'PUT') {
      const response = await mirrorPut(request, env, path);
      return corsResponse(response, origin);
    }

    if (path && request.method === 'DELETE') {
      const response = await app.fetch(request, env);
      return corsResponse(await mirrorDelete(env, response, path), origin);
    }

    return corsResponse(await app.fetch(request, env), origin);
  },
};
