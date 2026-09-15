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

const WORKER_VERSION = '1.109.613';
const ASSET_RE = /^data\/[^/]+\/[a-z]\/[^/]+\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;

function assetContentType(path: string): string {
  const ext = path.toLowerCase().split('.').pop();
  return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : 'image/jpeg';
}

function json(data: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': origin, 'Cache-Control': 'no-store' },
  });
}

function cors(origin: string): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  return headers;
}

function isAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return '*';
  return origin === env.ALLOWED_ORIGIN ? origin : null;
}

function isAuthorized(request: Request, env: Env): boolean {
  const authorization = request.headers.get('Authorization');
  return Boolean(authorization && authorization === `Bearer ${env.ADMIN_SECRET}`);
}

function assetPathFromRequest(url: URL): string | null {
  const prefix = '/api/assets/';
  if (!url.pathname.startsWith(prefix)) return null;
  const raw = url.pathname.slice(prefix.length);
  try {
    const path = raw.split('/').map(segment => decodeURIComponent(segment)).join('/');
    return ASSET_RE.test(path) ? path : null;
  } catch {
    return null;
  }
}

function assetRequestPayload(request: Request): Promise<AssetRequest> {
  return request.json().catch(() => ({})) as Promise<AssetRequest>;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = isAllowedOrigin(request, env);
    if (origin === null) return json({ ok: false, error: { code: 'CORS_FORBIDDEN', message: 'Origin 不被允許。' } }, 403, env.ALLOWED_ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    const url = new URL(request.url);
    const assetPath = assetPathFromRequest(url);
    if (assetPath) {
      if (request.method === 'GET') {
        const result = await getR2Asset(env.MERCH_ASSETS, assetPath);
        if (!result) return new Response('Not Found', { status: 404, headers: cors(origin) });
        const headers = cors(origin);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Content-Type', result.contentType || assetContentType(assetPath));
        return new Response(result.body, { status: 200, headers });
      }
      if (!isAuthorized(request, env)) return json({ ok: false, error: { code: 'UNAUTHORIZED', message: '未授權。' } }, 401, origin);
      if (request.method === 'PUT') {
        const payload = await assetRequestPayload(request);
        if (typeof payload.path !== 'string' || payload.path !== assetPath || typeof payload.content !== 'string') return json({ ok: false, error: { code: 'INVALID_ASSET', message: '圖片資料格式無效。' } }, 400, origin);
        const result = await putR2Asset(env.MERCH_ASSETS, assetPath, payload.content);
        return json({ ok: true, data: { path: assetPath, replaced: result.replaced, version: WORKER_VERSION } }, 200, origin);
      }
      if (request.method === 'DELETE') {
        const result = await deleteR2Asset(env.MERCH_ASSETS, assetPath);
        if (!result.deleted) return json({ ok: false, error: { code: 'NOT_FOUND', message: '圖片不存在。' } }, 404, origin);
        return json({ ok: true, data: { path: assetPath, deleted: true, version: WORKER_VERSION } }, 200, origin);
      }
    }

    const response = await app.fetch(request, env, ctx);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};

export default worker;
