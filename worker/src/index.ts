interface Env {
  ALLOWED_ORIGIN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  ADMIN_SECRET: string;
}
type GitHubRef = { object: { sha: string } };
type GitHubCommit = { sha: string; tree: { sha: string } };
type GitHubBlob = { sha: string; content: string; encoding: string };
type GitHubTreeEntry = { path?: string; type?: string; sha?: string };
type GitHubTree = { sha: string };
type WorkEntry = { id: string; name: string; code: string; path: string };
type WorkIndex = { schemaVersion: 2; works: WorkEntry[] };
type CategoryEntry = { id: string; path: string; title?: string; characters?: string[]; manufacturer?: string; quantity?: number; status?: string; cover?: string };
type CategoryIndex = { schemaVersion: 1; workId: string; category: string; items: CategoryEntry[] };
type ImageMeta = { id: string; file: string; alt?: string; isCover?: boolean; [key: string]: unknown };
type Item = { id: string; workId: string; title: string; series: string[]; characters: string[]; category: string; manufacturer: string; quantity: number; status: string; description: string; notes: string; purchase: Record<string, unknown>; arrival: Record<string, unknown>; afterSales: Record<string, unknown>; images: ImageMeta[]; [key: string]: unknown };
type RemoteState = { index: WorkIndex; version: string; headSha: string; baseTreeSha: string; files: Map<string, { content: string; sha: string }>; blobs: Map<string, string>; categories: Map<string, CategoryIndex>; items: Map<string, { item: Item; path: string; categoryPath: string; workId: string }>; paths: Set<string> };
type AssetRequest = { path: string; content: string };
type WriteEntry = { path: string; content?: string; encoding?: 'utf-8' | 'base64'; sha?: string; delete?: boolean };

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };
const MAX_ASSET_BASE64_LENGTH = 10 * 1024 * 1024;
const ASSET_RE = /^data\/[^/]+\/[^/]+\/[^/]+\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const ITEM_ID_RE = /^[A-Z]{2,3}[a-z]\d{3}$/;
const CATEGORY_RE = /^[a-z]$/;

function response(body: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS', 'Vary': 'Origin' } });
}
function ok(data: unknown, origin: string): Response { return response({ ok: true, data }, 200, origin); }
function fail(code: string, message: string, status: number, origin: string): Response { return response({ ok: false, error: { code, message } }, status, origin); }
function originFor(request: Request, env: Env): string | null { const origin = request.headers.get('Origin'); return !origin || origin === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : null; }
function authorized(request: Request, env: Env): boolean { return Boolean(env.ADMIN_SECRET) && request.headers.get('Authorization') === `Bearer ${env.ADMIN_SECRET}`; }
function githubHeaders(env: Env): HeadersInit { return { Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'chi-merch-api' }; }
async function githubJson<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> { const res = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...githubHeaders(env), ...(init.headers || {}) } }); if (!res.ok) { const detail = await res.text().catch(() => ''); const error = new Error(`GitHub request failed: ${res.status}${detail ? ` ${detail.slice(0, 240)}` : ''}`); (error as Error & { status?: number }).status = res.status; throw error; } return await res.json() as T; }
function decodeBase64(content: string): Uint8Array { const binary = atob(content.replace(/\s/g, '')); return Uint8Array.from(binary, char => char.charCodeAt(0)); }
function decodeText(content: string): string { return new TextDecoder().decode(decodeBase64(content)); }
function jsonFile(content: unknown): string { return JSON.stringify(content, null, 2) + '\n'; }
function bumpPatch(version: string): string { const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version); if (!match) throw new Error('version.json 格式無效'); return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`; }

async function loadRemote(env: Env): Promise<RemoteState> {
  const ref = await githubJson<GitHubRef>(env, `/repos/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`);
  const headSha = ref.object.sha;
  const head = await githubJson<GitHubCommit>(env, `/repos/${env.GITHUB_REPO}/git/commits/${headSha}`);
  const tree = await githubJson<{ tree: GitHubTreeEntry[]; truncated?: boolean }>(env, `/repos/${env.GITHUB_REPO}/git/trees/${head.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error('GitHub 資料樹過大，無法安全載入。');
  const blobs = new Map<string, string>();
  for (const entry of tree.tree) if (entry.type === 'blob' && typeof entry.path === 'string' && typeof entry.sha === 'string') blobs.set(entry.path, entry.sha);
  const paths = new Set(blobs.keys());
  const wanted = tree.tree.filter(entry => entry.type === 'blob' && typeof entry.path === 'string' && (entry.path === 'data/works.json' || entry.path === 'public/data/version.json' || (entry.path.startsWith('data/') && entry.path.endsWith('.json'))));
  const files = new Map<string, { content: string; sha: string }>();
  await Promise.all(wanted.map(async entry => { const sha = entry.sha as string; const blob = await githubJson<GitHubBlob>(env, `/repos/${env.GITHUB_REPO}/git/blobs/${sha}`); files.set(entry.path as string, { content: decodeText(blob.content), sha }); }));
  const indexFile = files.get('data/works.json');
  const versionFile = files.get('public/data/version.json');
  if (!indexFile || !versionFile) throw new Error('新資料根索引或版本檔不存在。');
  const index = JSON.parse(indexFile.content) as WorkIndex;
  const version = (JSON.parse(versionFile.content) as { version?: string }).version;
  if (index.schemaVersion !== 2 || !Array.isArray(index.works) || !version) throw new Error('新資料格式無效。');
  const categories = new Map<string, CategoryIndex>();
  const items = new Map<string, { item: Item; path: string; categoryPath: string; workId: string }>();
  for (const entry of index.works) {
    const prefix = `${entry.path}/`;
    const categoryFiles = [...files.entries()].filter(([path]) => path.startsWith(prefix) && /^data\/[^/]+\/[a-z]\/index\.json$/.test(path));
    for (const [categoryPath, file] of categoryFiles) {
      const category = JSON.parse(file.content) as CategoryIndex;
      if (category.schemaVersion !== 1 || category.workId !== entry.id || !CATEGORY_RE.test(category.category) || !Array.isArray(category.items)) throw new Error(`類型索引格式無效：${categoryPath}`);
      categories.set(categoryPath, category);
      for (const summary of category.items) {
        const itemFile = files.get(summary.path);
        if (!itemFile) throw new Error(`找不到 Item：${summary.id}`);
        const item = JSON.parse(itemFile.content) as Item;
        if (item.id !== summary.id || item.workId !== entry.id || item.category !== category.category) throw new Error(`Item 索引不一致：${summary.id}`);
        if (!Array.isArray(item.images)) item.images = [];
        items.set(item.id, { item, path: summary.path, categoryPath, workId: entry.id });
      }
    }
  }
  return { index, version, headSha, baseTreeSha: head.tree.sha, files, blobs, categories, items, paths };
}
function allWorks(remote: RemoteState) { return remote.index.works.map(work => ({ id: work.id, name: work.name, code: work.code, items: [...remote.items.values()].filter(entry => entry.workId === work.id).map(entry => entry.item) })); }
async function dataResponse(env: Env, origin: string): Promise<Response> { const remote = await loadRemote(env); return ok({ works: allWorks(remote), version: remote.version }, origin); }

function validateItem(item: unknown): asserts item is Item {
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Item 必須是物件');
  const value = item as Record<string, unknown>;
  if (typeof value.id !== 'string' || !ITEM_ID_RE.test(value.id)) throw new Error('Item ID 格式無效');
  if (typeof value.workId !== 'string' || !value.workId) throw new Error('workId 為必填欄位');
  if (typeof value.title !== 'string' || !value.title.trim()) throw new Error('標題為必填欄位');
  if (!CATEGORY_RE.test(String(value.category || ''))) throw new Error('category 格式無效');
  if (!Array.isArray(value.series) || value.series.some(entry => typeof entry !== 'string')) throw new Error('series 必須是字串陣列');
  if (!Array.isArray(value.characters) || value.characters.some(entry => typeof entry !== 'string')) throw new Error('characters 必須是字串陣列');
  if (typeof value.quantity !== 'number' || !Number.isInteger(value.quantity) || value.quantity < 1) throw new Error('quantity 必須是大於等於 1 的整數');
  if (!Array.isArray(value.images) || value.images.some(image => !image || typeof image !== 'object' || Array.isArray(image))) throw new Error('images 格式無效');
  for (const forbidden of ['workName', 'shipping', 'material', 'release', 'createdAt', 'updatedAt']) if (forbidden in value) throw new Error(`禁止儲存欄位：${forbidden}`);
}
function normalizeItemForStorage(item: Item): Item { const copy = JSON.parse(JSON.stringify(item)) as Item; delete copy.workName; return copy; }
function withoutImages(item: Item): Item { const copy = normalizeItemForStorage(item); delete copy.images; return copy; }
function sameNonImageItem(a: Item, b: Item): boolean { return JSON.stringify(withoutImages(a)) === JSON.stringify(withoutImages(b)); }
function categoryEntry(item: Item, path: string): CategoryEntry { const cover = item.images.find(image => image.isCover === true); return { id: item.id, path, title: item.title, characters: item.characters, manufacturer: item.manufacturer, quantity: item.quantity, status: item.status, ...(cover?.file ? { cover: cover.file } : {}) }; }
async function createBlob(env: Env, content: string, encoding: 'utf-8' | 'base64' = 'utf-8'): Promise<string> { const result = await githubJson<GitHubBlob>(env, `/repos/${env.GITHUB_REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content, encoding }) }); return result.sha; }
async function createAtomicCommit(env: Env, remote: RemoteState, files: WriteEntry[], message: string): Promise<void> {
  const entries = [] as { path: string; mode: '100644'; type: 'blob'; sha: string | null }[];
  for (const file of files) entries.push({ path: file.path, mode: '100644', type: 'blob', sha: file.delete ? null : file.sha || await createBlob(env, file.content || '', file.encoding || 'utf-8') });
  const tree = await githubJson<GitHubTree>(env, `/repos/${env.GITHUB_REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: remote.baseTreeSha, tree: entries }) });
  const commit = await githubJson<GitHubCommit>(env, `/repos/${env.GITHUB_REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [remote.headSha] }) });
  try { await githubJson(env, `/repos/${env.GITHUB_REPO}/git/refs/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) }); }
  catch (error) { if ((error as Error & { status?: number }).status === 422) throw new Error('資料在寫入期間已被其他操作更新，這次修改未套用。請重新載入後再試。'); throw error; }
}

async function updateItem(env: Env, id: string, input: unknown, origin: string): Promise<Response> {
  const item = (input as { item?: unknown } | null)?.item; validateItem(item); if (item.id !== id) return fail('ID_MISMATCH', '路由 Item ID 與 payload 不一致。', 400, origin);
  const remote = await loadRemote(env); const work = remote.index.works.find(entry => entry.id === item.workId); if (!work) return fail('WORK_NOT_FOUND', '找不到 Item 所屬作品。', 404, origin);
  const existing = remote.items.get(id); if (existing && existing.workId !== item.workId) return fail('WORK_CHANGE', '既有 Item 不允許更換作品。', 400, origin);
  const storageItem = normalizeItemForStorage(item); const newPath = `data/${work.id}/${storageItem.category}/${id}/data.json`; const newCategoryPath = `data/${work.id}/${storageItem.category}/index.json`;
  const writes: WriteEntry[] = [{ path: newPath, content: jsonFile(storageItem) }];
  if (existing && existing.path !== newPath) {
    const oldPrefix = `data/${existing.workId}/${existing.item.category}/${id}/images/`;
    const newPrefix = `data/${work.id}/${storageItem.category}/${id}/images/`;
    const oldImages = [...remote.paths].filter(path => path.startsWith(oldPrefix));
    const conflicting = [...remote.paths].filter(path => path.startsWith(newPrefix));
    if (conflicting.length) return fail('ITEM_MOVE_CONFLICT', '目標 Item 圖片目錄已存在，為避免覆蓋其他資料，移動已取消。', 409, origin);
    for (const oldPath of oldImages) {
      const sha = remote.blobs.get(oldPath);
      if (!sha) return fail('ASSET_NOT_FOUND', `找不到要搬移的圖片：${oldPath}`, 409, origin);
      writes.push({ path: `${newPrefix}${oldPath.slice(oldPrefix.length)}`, sha });
      writes.push({ path: oldPath, delete: true });
    }
    writes.push({ path: existing.path, delete: true });
    const oldIndex = remote.categories.get(existing.categoryPath); if (oldIndex) writes.push({ path: existing.categoryPath, content: jsonFile({ ...oldIndex, items: oldIndex.items.filter(entry => entry.id !== id) }) });
  }
  const newIndex = remote.categories.get(newCategoryPath); const nextEntries = (newIndex?.items || []).filter(entry => entry.id !== id); nextEntries.push(categoryEntry(storageItem, newPath)); writes.push({ path: newCategoryPath, content: jsonFile({ schemaVersion: 1, workId: work.id, category: storageItem.category, items: nextEntries }) });
  if (!existing || !sameNonImageItem(existing.item, storageItem) || existing.path !== newPath) {
    const nextVersion = bumpPatch(remote.version);
    writes.push({ path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) });
  }
  await createAtomicCommit(env, remote, writes, `${existing ? 'fix: update' : 'feat: add'} item ${id}`); return dataResponse(env, origin);
}
async function deleteItem(env: Env, id: string, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const existing = remote.items.get(id); if (!existing) return fail('ITEM_NOT_FOUND', '找不到要刪除的收藏。', 404, origin);
  const writes: WriteEntry[] = [{ path: existing.path, delete: true }]; const category = remote.categories.get(existing.categoryPath); if (category) writes.push({ path: existing.categoryPath, content: jsonFile({ ...category, items: category.items.filter(entry => entry.id !== id) }) });
  const prefix = `data/${existing.workId}/${existing.item.category}/${id}/images/`; for (const path of remote.paths) if (path.startsWith(prefix)) writes.push({ path, delete: true });
  const nextVersion = bumpPatch(remote.version); writes.push({ path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }); await createAtomicCommit(env, remote, writes, `fix: delete item ${id}`); return dataResponse(env, origin);
}

function assetParts(path: string) { const match = /^data\/([^/]+)\/([^/]+)\/([^/]+)\/images\/([^/]+)$/.exec(path); return match ? { workId: match[1], category: match[2], itemId: match[3], file: match[4] } : null; }
function validateAssetPath(path: unknown): string { if (typeof path !== 'string' || !ASSET_RE.test(path) || path.includes('..')) throw new Error('圖片路徑格式無效。'); return path; }
function validateAssetPayload(value: unknown): AssetRequest { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('圖片請求格式無效。'); const body = value as Record<string, unknown>; const path = validateAssetPath(body.path); if (typeof body.content !== 'string' || !body.content) throw new Error('圖片內容為必填欄位。'); if (body.content.length > MAX_ASSET_BASE64_LENGTH) throw new Error('圖片檔案過大，請使用 10 MB 以下的圖片。'); if (!/^[A-Za-z0-9+/]*={0,2}$/.test(body.content.replace(/\s/g, ''))) throw new Error('圖片內容不是有效的 Base64。'); return { path, content: body.content.replace(/\s/g, '') }; }
function assetContentType(path: string): string { const ext = path.toLowerCase().split('.').pop(); return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : 'image/jpeg'; }
function imageIdForFile(file: string, images: ImageMeta[]): string { const stem = file.replace(/\.[^.]+$/, ''); if (!images.some(image => image.id === stem)) return stem; let index = 2; while (images.some(image => image.id === `${stem}-${index}`)) index += 1; return `${stem}-${index}`; }
function assetMetadata(item: Item, file: string): ImageMeta { const existing = item.images.find(image => image.file === file); if (existing) return existing; return { id: imageIdForFile(file, item.images), file }; }
function categoryWithItem(category: CategoryIndex, item: Item, itemPath: string): CategoryIndex { return { ...category, items: [...category.items.filter(entry => entry.id !== item.id), categoryEntry(item, itemPath)] }; }

async function getAsset(env: Env, path: string, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const parts = assetParts(path); if (!parts) return fail('INVALID_ASSET_PATH', '圖片路徑格式無效。', 400, origin);
  const entry = remote.items.get(parts.itemId); if (!entry || entry.workId !== parts.workId || entry.item.category !== parts.category) return fail('ITEM_PATH_MISMATCH', '圖片路徑與 Item 所屬位置不一致。', 400, origin);
  if (!remote.paths.has(path)) return fail('ASSET_NOT_FOUND', '找不到圖片。', 404, origin);
  const blob = await githubJson<GitHubBlob>(env, `/repos/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  const content = blob.content.replace(/\s/g, '');
  return new Response(decodeBase64(content), { status: 200, headers: { 'Content-Type': assetContentType(path), 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', ETag: `\"${blob.sha}\"` } });
}

async function putAsset(env: Env, asset: AssetRequest, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const parts = assetParts(asset.path); if (!parts) return fail('INVALID_ASSET_PATH', '圖片路徑格式無效。', 400, origin);
  const entry = remote.items.get(parts.itemId); if (!entry) return fail('ITEM_NOT_FOUND', '找不到圖片所屬的收藏。', 404, origin);
  if (entry.workId !== parts.workId || entry.item.category !== parts.category) return fail('ITEM_PATH_MISMATCH', '圖片路徑與 Item 所屬位置不一致。', 400, origin);
  const exists = remote.paths.has(asset.path); const item = normalizeItemForStorage(entry.item); const nextImages = [...item.images]; if (!nextImages.some(image => image.file === parts.file)) nextImages.push(assetMetadata(item, parts.file)); item.images = nextImages;
  const writes: WriteEntry[] = [{ path: asset.path, content: asset.content, encoding: 'base64' }, { path: entry.path, content: jsonFile(item) }];
  const category = remote.categories.get(entry.categoryPath); if (!category) return fail('CATEGORY_NOT_FOUND', '找不到圖片所屬類型索引。', 404, origin); writes.push({ path: entry.categoryPath, content: jsonFile(categoryWithItem(category, item, entry.path)) });
  if (!exists) { const nextVersion = bumpPatch(remote.version); writes.push({ path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }); }
  await createAtomicCommit(env, remote, writes, `${exists ? 'fix: replace' : 'feat: add'} image ${parts.itemId}/${parts.file}`);
  return ok({ path: asset.path, replaced: exists, version: exists ? remote.version : bumpPatch(remote.version) }, origin);
}

async function deleteAsset(env: Env, path: string, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const parts = assetParts(path); if (!parts) return fail('INVALID_ASSET_PATH', '圖片路徑格式無效。', 400, origin);
  const entry = remote.items.get(parts.itemId); if (!entry) return fail('ITEM_NOT_FOUND', '找不到圖片所屬的收藏。', 404, origin);
  if (entry.workId !== parts.workId || entry.item.category !== parts.category) return fail('ITEM_PATH_MISMATCH', '圖片路徑與 Item 所屬位置不一致。', 400, origin);
  if (!remote.paths.has(path)) return fail('ASSET_NOT_FOUND', '找不到要刪除的圖片。', 404, origin);
  const item = normalizeItemForStorage(entry.item); item.images = item.images.filter(image => image.file !== parts.file); const writes: WriteEntry[] = [{ path, delete: true }, { path: entry.path, content: jsonFile(item) }];
  const category = remote.categories.get(entry.categoryPath); if (!category) return fail('CATEGORY_NOT_FOUND', '找不到圖片所屬類型索引。', 404, origin); writes.push({ path: entry.categoryPath, content: jsonFile(categoryWithItem(category, item, entry.path)) });
  const nextVersion = bumpPatch(remote.version); writes.push({ path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }); await createAtomicCommit(env, remote, writes, `fix: delete image ${parts.itemId}/${parts.file}`); return ok({ path, deleted: true, version: nextVersion }, origin);
}

async function cleanupAssets(env: Env, origin: string): Promise<Response> {
  const remote = await loadRemote(env); const referenced = new Set<string>(); for (const entry of remote.items.values()) for (const image of entry.item.images) referenced.add(`data/${entry.workId}/${entry.item.category}/${entry.item.id}/images/${image.file}`);
  const orphaned = [...remote.paths].filter(path => /^data\/[^/]+\/[a-z]\/[^/]+\/images\//.test(path) && !referenced.has(path)); if (!orphaned.length) return ok({ deleted: 0, version: remote.version }, origin);
  const writes: WriteEntry[] = orphaned.map(path => ({ path, delete: true })); const nextVersion = bumpPatch(remote.version); writes.push({ path: 'public/data/version.json', content: jsonFile({ version: nextVersion }) }); await createAtomicCommit(env, remote, writes, `fix: cleanup ${orphaned.length} orphan images`); return ok({ deleted: orphaned.length, version: nextVersion }, origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = originFor(request, env); if (!origin) return fail('ORIGIN_NOT_ALLOWED', '來源網域不被允許。', 403, '*');
    if (request.method === 'OPTIONS') return response({}, 204, origin);
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/auth/status' && request.method === 'GET') return ok({ authenticated: authorized(request, env) }, origin);
      if (url.pathname === '/api/data' && request.method === 'GET') return dataResponse(env, origin);
      const itemMatch = url.pathname.match(/^\/api\/items\/([^/]+)$/);
      if (itemMatch) { if (!authorized(request, env)) return fail('UNAUTHORIZED', '需要管理員權限。', 401, origin); const id = decodeURIComponent(itemMatch[1]); if (request.method === 'PUT') return updateItem(env, id, await request.json(), origin); if (request.method === 'DELETE') return deleteItem(env, id, origin); }
      if (url.pathname === '/api/assets/cleanup' && request.method === 'POST') { if (!authorized(request, env)) return fail('UNAUTHORIZED', '需要管理員權限。', 401, origin); return cleanupAssets(env, origin); }
      const assetPath = url.pathname.startsWith('/api/assets/') ? decodeURIComponent(url.pathname.slice('/api/assets/'.length)) : '';
      if (assetPath) { if (request.method === 'GET') return getAsset(env, validateAssetPath(assetPath), origin); if (!authorized(request, env)) return fail('UNAUTHORIZED', '需要管理員權限。', 401, origin); if (request.method === 'PUT') return putAsset(env, validateAssetPayload(await request.json()), origin); if (request.method === 'DELETE') return deleteAsset(env, validateAssetPath(assetPath), origin); }
      return fail('NOT_FOUND', 'API 路由不存在。', 404, origin);
    } catch (error) { console.error(error); return fail('INTERNAL_ERROR', error instanceof Error ? error.message : '伺服器處理失敗。', 500, origin); }
  }
};
