interface Env {
  ALLOWED_ORIGIN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  ADMIN_SECRET: string;
}

type GitHubContent = { content: string; sha: string };
type GitHubRef = { object: { sha: string } };
type GitHubCommit = { sha: string; tree: { sha: string } };
type GitHubBlob = { sha: string };
type GitHubTree = { sha: string };
type WorkIndex = { schemaVersion: number; works: { id: string; name: string; code: string; data: string }[] };
type Item = { id: string; workId: string; workName?: string; title: string; quantity: number; [key: string]: unknown };
type WorkPayload = { schemaVersion?: number; work?: { id?: string; name?: string }; items: Item[] };
type RemoteFile = { path: string; content: string; sha: string };
type RemoteState = { index: WorkIndex; works: { path: string; payload: WorkPayload; sha: string }[]; version: string; versionSha: string; headSha: string; baseTreeSha: string };

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };
const API_PREFIX = '/api/';
const ALLOWED_API_PATHS = new Set(['/api/data', '/api/auth/status']);
function response(body: unknown, status = 200, origin = '*'): Response { return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Vary': 'Origin' } }); }
function ok(data: unknown, origin: string): Response { return response({ ok: true, data }, 200, origin); }
function fail(code: string, message: string, status: number, origin: string): Response { return response({ ok: false, error: { code, message } }, status, origin); }
function assertOrigin(request: Request, env: Env): string | null { const origin = request.headers.get('Origin'); return !origin || origin === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : null; }
function authorized(request: Request, env: Env): boolean { return Boolean(env.ADMIN_SECRET) && request.headers.get('Authorization') === `Bearer ${env.ADMIN_SECRET}`; }
function githubHeaders(env: Env): HeadersInit { return { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' }; }
async function githubJson<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...githubHeaders(env), ...(init.headers || {}) } });
  if (!res.ok) { const detail = await res.text().catch(() => ''); const error = new Error(`GitHub request failed: ${res.status}${detail ? ` ${detail.slice(0, 240)}` : ''}`); (error as Error & { status?: number }).status = res.status; throw error; }
  return await res.json() as T;
}
function decodeContent(content: string): string { const binary = atob(content.replace(/\n/g, '')); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); return new TextDecoder().decode(bytes); }
async function readFile(env: Env, path: string, ref: string): Promise<RemoteFile> { const result = await githubJson<GitHubContent>(env, `/repos/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(ref)}`); return { path, content: decodeContent(result.content), sha: result.sha }; }
async function loadRemote(env: Env): Promise<RemoteState> {
  const ref = await githubJson<GitHubRef>(env, `/repos/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`); const headSha = ref.object.sha;
  const head = await githubJson<GitHubCommit>(env, `/repos/${env.GITHUB_REPO}/git/commits/${headSha}`);
  const indexFile = await readFile(env, 'public/data/works.json', headSha); const index = JSON.parse(indexFile.content) as WorkIndex;
  if (index.schemaVersion !== 1 || !Array.isArray(index.works)) throw new Error('works.json 格式無效');
  const works = await Promise.all(index.works.map(async entry => { const file = await readFile(env, `public/${entry.data}`, headSha); const payload = JSON.parse(file.content) as WorkPayload; if (!Array.isArray(payload.items)) throw new Error(`作品資料格式無效：${entry.code}`); return { path: file.path, payload, sha: file.sha }; }));
  const versionFile = await readFile(env, 'public/data/version.json', headSha); const version = (JSON.parse(versionFile.content) as { version?: string }).version; if (!version) throw new Error('version.json 格式無效');
  return { index, works, version, versionSha: versionFile.sha, headSha, baseTreeSha: head.tree.sha };
}
function allWorks(remote: RemoteState) { return remote.index.works.map((entry, index) => ({ id: entry.id, name: entry.name, code: entry.code, items: remote.works[index].payload.items })); }
async function dataResponse(env: Env, origin: string): Promise<Response> { const remote = await loadRemote(env); return ok({ works: allWorks(remote), version: remote.version }, origin); }
function validateItem(item: unknown): asserts item is Item {
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Item 必須是物件');
  const value = item as Record<string, unknown>;
  if (typeof value.id !== 'string' || !value.id) throw new Error('Item ID 無效');
  if (typeof value.title !== 'string' || !value.title.trim()) throw new Error('標題為必填欄位');
  if (typeof value.quantity !== 'number' || !Number.isInteger(value.quantity) || value.quantity < 1) throw new Error('quantity 必須是大於等於 1 的整數');
  if (value.workId !== undefined && typeof value.workId !== 'string') throw new Error('workId 格式無效');
  if (value.workName !== undefined && typeof value.workName !== 'string') throw new Error('workName 格式無效');
  if (value.characters !== undefined && (!Array.isArray(value.characters) || value.characters.some(entry => typeof entry !== 'string'))) throw new Error('characters 格式無效');
  if (value.purchase !== undefined && (typeof value.purchase !== 'object' || value.purchase === null || Array.isArray(value.purchase))) throw new Error('purchase 格式無效');
}
function parseItemId(id: string): { workCode: string; categoryCode: string; sequence: number } | null { const match = /^([A-Z]{2,3})([a-z])(\d{3})$/.exec(id); return match ? { workCode: match[1], categoryCode: match[2], sequence: Number(match[3]) } : null; }
function bumpPatch(version: string): string { const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version); if (!match) throw new Error('version.json 格式無效'); return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`; }
function jsonFile(content: unknown): string { return JSON.stringify(content, null, 2) + '\n'; }
async function createBlob(env: Env, content: string): Promise<string> { const result = await githubJson<GitHubBlob>(env, `/repos/${env.GITHUB_REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content, encoding: 'utf-8' }) }); return result.sha; }
async function createAtomicCommit(env: Env, remote: RemoteState, files: { path: string; content: string }[], message: string): Promise<void> {
  const treeEntries = [] as { path: string; mode: '100644'; type: 'blob'; sha: string }[]; for (const file of files) treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha: await createBlob(env, file.content) });
  const tree = await githubJson<GitHubTree>(env, `/repos/${env.GITHUB_REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: remote.baseTreeSha, tree: treeEntries }) });
  const commit = await githubJson<GitHubCommit>(env, `/repos/${env.GITHUB_REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [remote.headSha] }) });
  try { await githubJson(env, `/repos/${env.GITHUB_REPO}/git/refs/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) }); } catch (error) { const status = (error as Error & { status?: number }).status; if (status === 422) throw new Error('資料在寫入期間已被其他操作更新，這次修改未套用。請重新載入後再試。'); throw error; }
}
async function updateItem(env: Env, id: string, item: Item, origin: string): Promise<Response> {
  validateItem(item); if (item.id !== id) return fail('ID_MISMATCH', '路由 Item ID 與 payload 不一致。', 400, origin); const remote = await loadRemote(env); const parsed = parseItemId(id); if (!parsed) return fail('INVALID_ID', 'Item ID 格式無效。', 400, origin);
  const workIndex = remote.index.works.findIndex(entry => entry.code === parsed.workCode); if (workIndex < 0) return fail('WORK_NOT_FOUND', '找不到 Item 所屬作品。', 404, origin); const payload = remote.works[workIndex].payload; const itemIndex = payload.items.findIndex(entry => entry.id === id); if (itemIndex < 0) return fail('ITEM_NOT_FOUND', '找不到要編輯的收藏。', 404, origin);
  const current = payload.items[itemIndex]; payload.items[itemIndex] = { ...item, workId: current.workId, workName: current.workName, updatedAt: new Date().toISOString() }; const nextVersion = bumpPatch(remote.version);
  await createAtomicCommit(env, remote, [{ path: remote.works[workIndex].path, content: jsonFile(payload) }, { path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }], `fix: update item ${id}`); return dataResponse(env, origin);
}
async function deleteItem(env: Env, id: string, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const parsed = parseItemId(id); if (!parsed) return fail('INVALID_ID', 'Item ID 格式無效。', 400, origin); const workIndex = remote.index.works.findIndex(entry => entry.code === parsed.workCode); if (workIndex < 0) return fail('WORK_NOT_FOUND', '找不到 Item 所屬作品。', 404, origin); const payload = remote.works[workIndex].payload; if (!payload.items.some(entry => entry.id === id)) return fail('ITEM_NOT_FOUND', '找不到要刪除的收藏。', 404, origin);
  payload.items = payload.items.filter(entry => entry.id !== id); const nextVersion = bumpPatch(remote.version); await createAtomicCommit(env, remote, [{ path: remote.works[workIndex].path, content: jsonFile(payload) }, { path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }], `fix: delete item ${id}`); return dataResponse(env, origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = assertOrigin(request, env); if (!origin) return fail('CORS_ORIGIN_DENIED', '不允許的來源。', 403, env.ALLOWED_ORIGIN);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Vary': 'Origin' } });
    const url = new URL(request.url); const path = url.pathname;
    try {
      if (path === '/api/data' && request.method === 'GET') return await dataResponse(env, origin);
      if (path === '/api/auth/status' && request.method === 'GET') return ok({ authenticated: authorized(request, env) }, origin);
      if (!path.startsWith(API_PREFIX)) return fail('NOT_FOUND', '找不到 API 路由。', 404, origin);
      if (ALLOWED_API_PATHS.has(path)) return fail('METHOD_NOT_ALLOWED', '不支援此 API 方法。', 405, origin);
      const match = path.match(/^\/api\/items\/([^/]+)$/);
      if (!match) return fail('NOT_FOUND', '找不到 API 路由。', 404, origin);
      if ((request.method === 'PUT' || request.method === 'DELETE') && !authorized(request, env)) return fail('UNAUTHORIZED', '管理權限驗證失敗。', 401, origin);
      if (request.method === 'PUT') {
        let body: unknown; try { body = await request.json(); } catch { return fail('INVALID_JSON', '請求內容不是有效 JSON。', 400, origin); }
        if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('INVALID_DATA', '請求內容格式無效。', 400, origin);
        const item = (body as { item?: unknown }).item; validateItem(item); return await updateItem(env, decodeURIComponent(match[1]), item, origin);
      }
      if (request.method === 'DELETE') return await deleteItem(env, decodeURIComponent(match[1]), origin);
      return fail('METHOD_NOT_ALLOWED', '不支援此 API 方法。', 405, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'API 處理失敗。'; const status = (error as Error & { status?: number }).status;
      if (status === 401 || status === 403) return fail('GITHUB_AUTH_ERROR', 'Worker 無法取得 GitHub 寫入權限。', 502, origin);
      if (status === 404) return fail('GITHUB_NOT_FOUND', 'GitHub 遠端資料不存在。', 502, origin);
      if (message.includes('寫入期間已被其他操作更新')) return fail('STALE_STATE', message, 409, origin);
      if (message.includes('格式無效') || message.includes('必須') || message.includes('無效')) return fail('INVALID_DATA', message, 400, origin);
      return fail('API_ERROR', message, 500, origin);
    }
  }
};
