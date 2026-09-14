import app from './index';
import { deleteR2Asset, getR2Asset, putR2Asset } from './r2-assets';

interface Env {
  ALLOWED_ORIGIN: string;
  MERCH_ASSETS: R2Bucket;
}

const ASSET_RE = /^data\/[^/]+\/[a-z]\/[^/]+\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;

function assetContentType(path: string): string {
  const ext = path.toLowerCase().split('.').pop();
  return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : 'image/jpeg';
}

function corsResponse(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
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

async function getFromR2(request: Request, env: Env, origin: string, path: string): Promise<Response | null> {
  const asset = await getR2Asset(env.MERCH_ASSETS, path);
  if (!asset?.body) return null;
  const headers = new Headers({
    'Content-Type': asset.httpMetadata?.contentType || assetContentType(path),
    'Cache-Control': asset.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  });
  if (asset.etag) headers.set('ETag', asset.etag);
  return new Response(asset.body, { status: 200, headers });
}

async function mirrorPut(request: Request, env: Env, response: Response, path: string): Promise<Response> {
  if (!response.ok) return response;
  try {
    const body = await request.clone().json() as { path?: unknown; content?: unknown };
    if (body.path !== path || typeof body.content !== 'string' || !body.content) return response;
    const binary = atob(body.content.replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    await putR2Asset(env.MERCH_ASSETS, path, bytes, assetContentType(path));
  } catch (error) {
    console.error('R2 image mirror PUT failed; GitHub remains authoritative.', error);
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
    if (!origin) return new Response(JSON.stringify({ ok: false, error: { code: 'ORIGIN_NOT_ALLOWED', message: '來源網域不被允許。' } }), { status: 403, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

    const path = r2AssetPath(request);
    if (path && request.method === 'GET') {
      const r2Response = await getFromR2(request, env, origin, path);
      if (r2Response) return r2Response;
    }

    if (path && request.method === 'PUT') {
      const response = await app.fetch(request, env);
      return corsResponse(await mirrorPut(request, env, response, path), origin);
    }

    if (path && request.method === 'DELETE') {
      const response = await app.fetch(request, env);
      return corsResponse(await mirrorDelete(env, response, path), origin);
    }

    return corsResponse(await app.fetch(request, env), origin);
  },
};
