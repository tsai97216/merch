interface Env { ALLOWED_ORIGIN: string; GITHUB_REPO: string; GITHUB_BRANCH: string; GITHUB_TOKEN: string; ADMIN_SECRET: string }
type GitHubRef = { object: { sha: string } };
type GitHubCommit = { sha: string; tree: { sha: string } };
type GitHubBlob = { sha: string; content: string; encoding: string };
type GitHubContent = { type?: string; path?: string; name?: string; sha?: string; content?: string; encoding?: string };
type WorkEntry = { id: string; name: string; code: string; path: string };
type WorkIndex = { schemaVersion: 2; works: WorkEntry[] };
type CategoryEntry = { id: string; path: string; title?: string; characters?: string[]; manufacturer?: string; quantity?: number; status?: string; cover?: string };
type CategoryIndex = { schemaVersion: 1; workId: string; category: string; items: CategoryEntry[] };
type ImageMeta = { id: string; file: string; alt?: string; isCover?: boolean; [key: string]: unknown };
type Item = { id: string; workId: string; title: string; series: string[]; characters: string[]; category: string; manufacturer: string; quantity: number; status: string; description: string; notes: string; purchase: Record<string, unknown>; arrival: Record<string, unknown>; afterSales: Record<string, unknown>; images: ImageMeta[]; [key: string]: unknown };
type ItemRef = { item: Item; path: string; categoryPath: string; workId: string };
type RemoteState = { index: WorkIndex; version: string; shipping: ShippingRecord[]; headSha: string; baseTreeSha: string; files: Map<string, { content: string; sha: string }>; blobs: Map<string, string>; categories: Map<string, CategoryIndex>; items: Map<string, ItemRef>; paths: Set<string> };
type WriteEntry = { path: string; content?: string; encoding?: 'utf-8' | 'base64'; sha?: string; delete?: boolean };
type AssetRequest = { path: string; content: string };
type ShippingRecord = { id: string; amount: number; currency: string; date?: string; carrier?: string; note?: string; itemIds: string[] };
type ShippingData = { schemaVersion: 1; records: ShippingRecord[] };

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };
const MAX_ASSET_BASE64_LENGTH = 10 * 1024 * 1024;
const ASSET_RE = /^data\/[^/]+\/[a-z]\/[^/]+\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const ITEM_ID_RE = /^[A-Z]{2,3}[a-z]\d{3}$/;
const CATEGORY_RE = /^[a-z]$/;
const WORK_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORK_CODE_RE = /^[A-Z]{2,3}$/;

function response(body: unknown, status = 200, origin = '*'): Response { return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', Vary: 'Origin' } }); }
function ok(data: unknown, origin: string): Response { return response({ ok: true, data }, 200, origin); }
function fail(code: string, message: string, status: number, origin: string): Response { return response({ ok: false, error: { code, message } }, status, origin); }
function originFor(request: Request, env: Env): string | null { const origin = request.headers.get('Origin'); return !origin || origin === env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN : null; }
function authorized(request: Request, env: Env): boolean { return Boolean(env.ADMIN_SECRET) && request.headers.get('Authorization') === `Bearer ${env.ADMIN_SECRET}`; }
function githubHeaders(env: Env): HeadersInit { return { Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'chi-merch-api' }; }
async function githubJson<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> { const res = await fetch(`https://api.github.com${path}`, { ...init, headers: { ...githubHeaders(env), ...(init.headers || {}) } }); if (!res.ok) { const detail = await res.text().catch(() => ''); const error = new Error(`GitHub request failed: ${res.status}${detail ? ` ${detail.slice(0, 240)}` : ''}`); (error as Error & { status?: number }).status = res.status; throw error; } return await res.json() as T; }
function decodeBase64(content: string): Uint8Array { const binary = atob(content.replace(/\s/g, '')); return Uint8Array.from(binary, char => char.charCodeAt(0)); }
function decodeText(content: string): string { return new TextDecoder().decode(decodeBase64(content)); }
function jsonFile(value: unknown): string { return JSON.stringify(value, null, 2) + '\n'; }
function bumpPatch(version: string): string { const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version); if (!m) throw new Error('version.json 格式無效'); return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`; }
async function contents<T = GitHubContent | GitHubContent[]>(env: Env, path: string): Promise<T> { return githubJson<T>(env, `/repos/${env.GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`); }
async function readJson(env: Env, path: string, files: Map<string, { content: string; sha: string }>, paths: Set<string>): Promise<string> { const entry = await contents<GitHubContent>(env, path); if (entry.type !== 'file' || !entry.content || !entry.sha) throw new Error(`找不到資料檔：${path}`); const text = entry.encoding === 'base64' ? decodeText(entry.content) : entry.content; files.set(path, { content: text, sha: entry.sha }); paths.add(path); return text; }
async function baseRemote(env: Env) { const ref = await githubJson<GitHubRef>(env, `/repos/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`); const headSha = ref.object.sha; const head = await githubJson<GitHubCommit>(env, `/repos/${env.GITHUB_REPO}/git/commits/${headSha}`); const files = new Map<string, { content: string; sha: string }>(); const blobs = new Map<string, string>(); const paths = new Set<string>(); const index = JSON.parse(await readJson(env, 'data/works.json', files, paths)) as WorkIndex; const version = (JSON.parse(await readJson(env, 'public/data/version.json', files, paths)) as { version?: string }).version; if (index.schemaVersion !== 2 || !Array.isArray(index.works) || !version) throw new Error('新資料格式無效。'); let shipping: ShippingRecord[] = []; try { const parsed = JSON.parse(await readJson(env, 'public/data/shipping.json', files, paths)) as ShippingData; if (parsed.schemaVersion === 1 && Array.isArray(parsed.records)) shipping = parsed.records; } catch {} return { index, version, shipping, headSha, baseTreeSha: head.tree.sha, files, blobs, paths }; }

async function categoryDirs(env: Env, root: string): Promise<string[]> { const dirs = await contents<GitHubContent[]>(env, root); if (!Array.isArray(dirs)) throw new Error(`作品目錄格式無效：${root}`); return dirs.filter(x => x.type === 'dir' && typeof x.name === 'string' && CATEGORY_RE.test(x.name)).map(x => `${root}/${x.name}/index.json`); }
async function readCategory(env: Env, path: string, files: Map<string, { content: string; sha: string }>, paths: Set<string>): Promise<CategoryIndex | null> { try { const category = JSON.parse(await readJson(env, path, files, paths)) as CategoryIndex; if (category.schemaVersion !== 1 || !category.workId || !CATEGORY_RE.test(category.category) || !Array.isArray(category.items)) return null; return category; } catch { return null; } }

async function loadRemoteTarget(env: Env, id: string): Promise<RemoteState> {
  const base = await baseRemote(env);
  const match = /^([A-Z]{2,3})[a-z]\d{3}$/.exec(id);
  if (!match) throw new Error(`Item ID 格式無效：${id}`);
  const work = base.index.works.find(entry => entry.code === match[1]);
  if (!work) throw new Error(`找不到 Item 所屬作品：${id}`);
  const root = work.path.replace(/\/$/, '');
  const categoryPaths = await categoryDirs(env, root);
  const categories = new Map<string, CategoryIndex>();
  const items = new Map<string, ItemRef>();
  const loaded = await Promise.all(categoryPaths.map(async categoryPath => ({ categoryPath, category: await readCategory(env, categoryPath, base.files, base.paths) })));
  for (const { categoryPath, category } of loaded) {
    if (!category) continue;
    if (category.workId !== work.id || category.category !== categoryPath.split('/').at(-2)) throw new Error(`類型索引格式無效：${categoryPath}`);
    categories.set(categoryPath, category);
  }
  const found = [...categories.entries()].flatMap(([categoryPath, category]) => category.items.filter(x => x.id === id).map(summary => ({ categoryPath, summary, category })))[0];
  if (!found) throw new Error(`找不到 Item：${id}`);
  const item = JSON.parse(await readJson(env, found.summary.path, base.files, base.paths)) as Item;
  if (item.id !== id || item.workId !== work.id || item.category !== found.category.category) throw new Error(`Item 索引不一致：${id}`);
  if (!Array.isArray(item.images)) item.images = [];
  items.set(id, { item, path: found.summary.path, categoryPath: found.categoryPath, workId: work.id });
  const imageDir = `data/${work.id}/${item.category}/${id}/images`;
  try { const imageEntries = await contents<GitHubContent[]>(env, imageDir); if (Array.isArray(imageEntries)) for (const image of imageEntries) if (image.type === 'file' && image.path && image.sha) { base.paths.add(image.path); base.blobs.set(image.path, image.sha); } } catch { /* empty */ }
  return { ...base, categories, items };
}

async function loadRemoteForNewItem(env: Env, id: string, workId: string, categoryCode: string): Promise<RemoteState> {
  const remote = await loadRemote(env);
  const work = remote.index.works.find(entry => entry.id === workId);
  if (!work) throw new Error(`找不到 Item 所屬作品：${workId}`);
  const match = /^([A-Z]{2,3})[a-z]\d{3}$/.exec(id);
  if (!match || match[1] !== work.code) throw new Error('Item ID 與作品代碼不一致。');
  if (!CATEGORY_RE.test(categoryCode)) throw new Error('category 格式無效');
  if (remote.items.has(id)) throw new Error(`Item ID 已存在：${id}`);
  const targetPath = `data/${work.id}/${categoryCode}/index.json`;
  const categories = new Map<string, CategoryIndex>();
  const category = remote.categories.get(targetPath);
  if (category) {
    if (category.workId !== work.id || category.category !== categoryCode) throw new Error(`類型索引格式無效：${targetPath}`);
    categories.set(targetPath, category);
  } else {
    categories.set(targetPath, { schemaVersion: 1, workId: work.id, category: categoryCode, items: [] });
  }
  return { ...remote, categories, items: new Map() };
}

async function loadRemote(env: Env): Promise<RemoteState> {
  const base = await baseRemote(env);
  const tree = await githubJson<{ tree: { path?: string; type?: string; sha?: string }[]; truncated?: boolean }>(env, `/repos/${env.GITHUB_REPO}/git/trees/${base.baseTreeSha}?recursive=1`);
  if (tree.truncated) throw new Error('GitHub 資料樹過大，無法安全載入。');
  for (const entry of tree.tree) if (entry.type === 'blob' && entry.path && entry.sha) base.blobs.set(entry.path, entry.sha);
  const categories = new Map<string, CategoryIndex>();
  const items = new Map<string, ItemRef>();
  const categoryEntries = tree.tree.filter(x => x.type === 'blob' && x.path && /^data\/[^/]+\/[a-z]\/index\.json$/.test(x.path));
  const loaded = await Promise.all(categoryEntries.map(async entry => ({ path: entry.path as string, category: await readCategory(env, entry.path as string, base.files, base.paths) })));
  for (const { path, category } of loaded) {
    if (!category) continue;
    categories.set(path, category);
  }
  const itemRefs = [...categories.values()].flatMap(category => category.items.map(summary => ({ category, summary })));
  const itemLoaded = await Promise.all(itemRefs.map(async ({ category, summary }) => ({ category, summary, item: JSON.parse(await readJson(env, summary.path, base.files, base.paths)) as Item })));
  for (const { category, summary, item } of itemLoaded) {
    if (!Array.isArray(item.images)) item.images = [];
    if (items.has(item.id)) throw new Error(`遠端資料存在重複 Item ID：${item.id}`);
    items.set(item.id, { item, path: summary.path, categoryPath: `data/${item.workId}/${category.category}/index.json`, workId: item.workId });
  }
  return { ...base, categories, items };
}
function allWorks(remote: RemoteState) { return remote.index.works.map(work => ({ id: work.id, name: work.name, code: work.code, items: [...remote.items.values()].filter(x => x.workId === work.id).map(x => x.item) })); }
async function dataResponse(env: Env, origin: string): Promise<Response> { const remote = await loadRemote(env); return ok({ works: allWorks(remote), version: remote.version, shipping: remote.shipping }, origin); }
function validateShipping(value: unknown, remote: RemoteState): ShippingRecord { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('運費紀錄格式無效。'); const v = value as Record<string, unknown>; if (typeof v.id !== 'string' || !/^ship-[A-Za-z0-9_-]+$/.test(v.id)) throw new Error('運費 ID 格式無效。'); if (typeof v.amount !== 'number' || !Number.isFinite(v.amount) || v.amount < 0) throw new Error('運費金額無效。'); if (typeof v.currency !== 'string' || !v.currency.trim()) throw new Error('運費幣別為必填。'); if (v.date !== undefined && typeof v.date !== 'string') throw new Error('運費日期無效。'); if (v.carrier !== undefined && typeof v.carrier !== 'string') throw new Error('物流欄位無效。'); if (v.note !== undefined && typeof v.note !== 'string') throw new Error('備註欄位無效。'); if (!Array.isArray(v.itemIds) || v.itemIds.length === 0 || v.itemIds.some(x => typeof x !== 'string')) throw new Error('至少需要一個關聯周邊。'); const ids = [...new Set(v.itemIds as string[])]; if (ids.length !== v.itemIds.length) throw new Error('關聯周邊不可重複。'); for (const id of ids) if (!remote.items.has(id)) throw new Error(`找不到關聯周邊：${id}`); return { id: v.id as string, amount: v.amount as number, currency: (v.currency as string).trim(), ...(typeof v.date === 'string' && v.date ? { date: v.date } : {}), ...(typeof v.carrier === 'string' && v.carrier.trim() ? { carrier: v.carrier.trim() } : {}), ...(typeof v.note === 'string' && v.note.trim() ? { note: v.note.trim() } : {}), itemIds: ids }; }
function shippingResponse(env: Env, origin: string): Promise<Response> { return baseRemote(env).then(remote => ok(remote.shipping, origin)); }
async function upsertShipping(env: Env, input: unknown, origin: string): Promise<Response> { const remote = await loadRemote(env); const record = validateShipping(input, remote); const records = remote.shipping.filter(x => x.id !== record.id); records.push(record); return commitRemote(env, remote, [{ path: 'public/data/shipping.json', content: jsonFile({ schemaVersion: 1, records }) }], `${remote.shipping.some(x => x.id === record.id) ? 'fix' : 'feat'}: ${remote.shipping.some(x => x.id === record.id) ? 'update' : 'add'} shipping ${record.id}`, origin, { shipping: records }); }
