interface Env {
  ALLOWED_ORIGIN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  ADMIN_SECRET: string;
}

type GitHubContent = { content: string; sha: string };
type WorkIndex = { schemaVersion: number; works: { id: string; name: string; code: string; data: string }[] };
type Item = { id: string; workId: string; workName?: string; title: string; quantity: number; [key: string]: unknown };
type WorkPayload = { schemaVersion?: number; work?: { id?: string; name?: string }; items: Item[] };

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

function response(body: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Vary': 'Origin' } });
}

function ok(data: unknown, origin: string): Response { return response({ ok: true, data }, 200, origin); }
function fail(code: string, message: string, status: number, origin: string): Response { return response({ ok: false, error: { code, message } }, status, origin); }

function assertAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin || origin === env.ALLOWED_ORIGIN) return env.ALLOWED_ORIGIN;
  return null;
}

function authorized(request: Request, env: Env): boolean {
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.ADMIN_SECRET}` && Boolean(env.ADMIN_SECRET);
}

function githubHeaders(env: Env): HeadersInit {
  return { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' };
}

async function githubJson<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...githubHeaders(env), ...(init.headers || {}) } });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
  return await response.json() as T;
}

function decodeContent(content: string): string {
  return atob(content.replace(/\n/g, ''));
}

function encodeContent(content: string): string {
  return btoa(unescape(encodeURIComponent(content)));
}

async function readFile(env: Env, path: string): Promise<{ content: string; sha: string }> {
  const result = await githubJson<GitHubContent>(env, `/repos/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  return { content: decodeContent(result.content), sha: result.sha };
}

async function writeFile(env: Env, path: string, content: string, sha: string, message: string): Promise<void> {
  await githubJson(env, `/repos/${env.GITHUB_REPO}/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message, content: encodeContent(content), sha, branch: env.GITHUB_BRANCH }) });
}

function validateItem(item: unknown): asserts item is Item {
  if (!item || typeof item !== 'object') throw new Error('Item 必須是物件');
  const value = item as Record<string, unknown>;
  if (typeof value.id !== 'string' || !value.id) throw new Error('Item ID 無效');
  if (typeof value.title !== 'string' || !value.title.trim()) throw new Error('標題為必填欄位');
  if (typeof value.quantity !== 'number' || !Number.isInteger(value.quantity) || value.quantity < 1) throw new Error('quantity 必須是大於等於 1 的整數');
}

function parseItemId(id: string): { workCode: string } | null {
  const match = /^([A-Z]{2,3})[a-z]\d+$/.exec(id);
  return match ? { workCode: match[1] } : null;
}

function bumpPatch(version: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error('version.json 格式無效');
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

async function loadRemote(env: Env): Promise<{ index: WorkIndex; works: { path: string; payload: WorkPayload; sha: string }[]; version: string; versionSha: string }> {
  const indexFile = await readFile(env, 'public/data/works.json');
  const index = JSON.parse(indexFile.content) as WorkIndex;
  if (index.schemaVersion !== 1 || !Array.isArray(index.works)) throw new Error('works.json 格式無效');
  const works = await Promise.all(index.works.map(async (entry) => {
    const file = await readFile(env, `public/${entry.data}`);
    return { path: `public/${entry.data}`, payload: JSON.parse(file.content) as WorkPayload, sha: file.sha };
  }));
  const versionFile = await readFile(env, 'public/data/version.json');
  const versionValue = JSON.parse(versionFile.content) as { version?: string };
  if (typeof versionValue.version !== 'string') throw new Error('version.json 格式無效');
  return { index, works, version: versionValue.version, versionSha: versionFile.sha };
}

function allWorks(remote: Awaited<ReturnType<typeof loadRemote>>): { id: string; name: string; code: string; items: Item[] }[] {
  return remote.index.works.map((entry, index) => ({ id: entry.id, name: entry.name, code: entry.code, items: remote.works[index].payload.items }));
}

async function dataResponse(env: Env, origin: string): Promise<Response> {
  const remote = await loadRemote(env);
  return ok({ works: allWorks(remote), version: remote.version }, origin);
}

async function updateItem(env: Env, id: string, item: Item, origin: string): Promise<Response> {
  validateItem(item);
  if (item.id !== id) return fail('ID_MISMATCH', '路由 Item ID 與 payload 不一致。', 400, origin);
  const remote = await loadRemote(env);
  const parsed = parseItemId(id);
  if (!parsed) return fail('INVALID_ID', 'Item ID 格式無效。', 400, origin);
  const workIndex = remote.index.works.findIndex((entry) => entry.code === parsed.workCode);
  if (workIndex < 0) return fail('WORK_NOT_FOUND', '找不到 Item 所屬作品。', 404, origin);
  const payload = remote.works[workIndex].payload;
  const itemIndex = payload.items.findIndex((entry) => entry.id === id);
  if (itemIndex < 0) return fail('ITEM_NOT_FOUND', '找不到要編輯的收藏。', 404, origin);
  const current = payload.items[itemIndex];
  const next = { ...item, workId: current.workId, workName: current.workName };
  payload.items[itemIndex] = next;
  await writeFile(env, remote.works[workIndex].path, JSON.stringify(payload, null, 2) + '\n', remote.works[workIndex].sha, `fix: update item ${id}`);
  return dataResponse(env, origin);
}

async function deleteItem(env: Env, id: string, origin: string): Promise<Response> {
  const remote = await loadRemote(env);
  const parsed = parseItemId(id);
  if (!parsed) return fail('INVALID_ID', 'Item ID 格式無效。', 400, origin);
  const workIndex = remote.index.works.findIndex((entry) => entry.code === parsed.workCode);
  if (workIndex < 0) return fail('WORK_NOT_FOUND', '找不到 Item 所屬作品。', 404, origin);
  const payload = remote.works[workIndex].payload;
  const nextItems = payload.items.filter((entry) => entry.id !== id);
  if (nextItems.length === payload.items.length) return fail('ITEM_NOT_FOUND', '找不到要刪除的收藏。', 404, origin);
  payload.items = nextItems;
  await writeFile(env, remote.works[workIndex].path, JSON.stringify(payload, null, 2) + '\n', remote.works[workIndex].sha, `fix: delete item ${id}`);
  const nextVersion = bumpPatch(remote.version);
  await writeFile(env, 'public/data/version.json', JSON.stringify({ version: nextVersion }, null, 2) + '\n', remote.versionSha, `chore: bump data version to ${nextVersion}`);
  return dataResponse(env, origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = assertAllowedOrigin(request, env);
    if (!origin) return fail('CORS_ORIGIN_DENIED', '不允許的來源。', 403, env.ALLOWED_ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Vary': 'Origin' } });

    const url = new URL(request.url);
    try {
      if (request.method === 'GET' && url.pathname === '/api/data') return await dataResponse(env, origin);
      if ((request.method === 'PUT' || request.method === 'DELETE') && !authorized(request, env)) return fail('UNAUTHORIZED', '管理權限驗證失敗。', 401, origin);
      const match = url.pathname.match(/^\/api\/items\/([^/]+)$/);
      if (match && request.method === 'PUT') {
        const body = await request.json() as { item?: unknown };
        validateItem(body.item);
        return await updateItem(env, decodeURIComponent(match[1]), body.item, origin);
      }
      if (match && request.method === 'DELETE') return await deleteItem(env, decodeURIComponent(match[1]), origin);
      return fail('NOT_FOUND', '找不到 API 路由。', 404, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'API 處理失敗。';
      return fail('API_ERROR', message, 500, origin);
    }
  },
};
