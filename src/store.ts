import type { Item, StoreState, UiState, VersionData, Work, WorksIndex, WorksIndexEntry, CategoryIndex } from './types';
import { defaultUiState } from './types';
import { parseItemId } from './item-id';
import { dataError, httpError, toAppError } from './error';
import { getRemoteData, putItem, deleteItem as deleteRemoteItem } from './api';

const VERSION_RE = /^\d+\.\d+\.\d+$/;
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> { if (!isRecord(value)) throw dataError(`${label} 必須是物件`); }
function normalizeQuantity(value: unknown, label: string): number { if (value === undefined) return 1; if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) throw dataError(`${label}.quantity 必須是大於等於 1 的整數`); return value; }
function normalizeStringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string').map(x => x.trim()).filter(Boolean) : typeof value === 'string' && value.trim() ? [value.trim()] : []; }
function validateWorksIndex(value: unknown): WorksIndex {
  assertRecord(value, 'works.json');
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2) throw dataError('works.json schemaVersion 不支援');
  if (!Array.isArray(value.works)) throw dataError('works.json works 必須是陣列');
  const works: WorksIndexEntry[] = value.works.map((entry, index) => {
    assertRecord(entry, `works[${index}]`);
    if (typeof entry.id !== 'string' || !entry.id) throw dataError(`works[${index}].id 無效`);
    if (typeof entry.name !== 'string' || !entry.name) throw dataError(`works[${index}].name 無效`);
    if (typeof entry.code !== 'string' || !/^[A-Z]{2,3}$/.test(entry.code)) throw dataError(`works[${index}].code 必須是 2～3 碼大寫作品代碼`);
    const location = typeof entry.path === 'string' ? entry.path : typeof entry.data === 'string' ? entry.data : '';
    if (!location || location.includes('..')) throw dataError(`works[${index}] 資料路徑無效`);
    return { id: entry.id, name: entry.name, code: entry.code, path: location };
  });
  const codes = new Set<string>();
  works.forEach(work => { if (codes.has(work.code)) throw dataError(`works.json 存在重複作品代碼：${work.code}`); codes.add(work.code); });
  return { schemaVersion: value.schemaVersion as 1 | 2, works };
}
function validateItem(value: unknown, label: string, work: WorksIndexEntry): Item {
  assertRecord(value, label);
  if (typeof value.id !== 'string' || !value.id) throw dataError(`${label}.id 無效`);
  if (typeof value.title !== 'string' || !value.title) throw dataError(`${label}.title 無效`);
  if (typeof value.status !== 'string' || !value.status) throw dataError(`${label}.status 無效`);
  const parsed = parseItemId(value.id);
  if (!parsed) throw dataError(`${label}.id 不符合永久 Item ID 格式：${value.id}`);
  if (parsed.workCode !== work.code) throw dataError(`${label}.id 作品代碼 ${parsed.workCode} 與資料作品 ${work.code} 不一致`);
  const category = typeof value.category === 'string' ? value.category : '';
  if (!category) throw dataError(`${label}.category 無效`);
  const images = value.images === undefined ? [] : value.images;
  if (!Array.isArray(images) || images.some(x => !isRecord(x) || typeof x.id !== 'string' || typeof x.file !== 'string')) throw dataError(`${label}.images 格式無效`);
  return {
    id: value.id,
    workId: work.id,
    workName: work.name,
    title: value.title,
    series: normalizeStringArray(value.series),
    characters: normalizeStringArray(value.characters),
    category,
    manufacturer: typeof value.manufacturer === 'string' ? value.manufacturer : '',
    quantity: normalizeQuantity(value.quantity, label),
    status: value.status,
    description: typeof value.description === 'string' ? value.description : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    purchase: isRecord(value.purchase) ? {
      ...(typeof value.purchase.price === 'number' ? { price: value.purchase.price } : {}),
      ...(typeof value.purchase.currency === 'string' ? { currency: value.purchase.currency } : {}),
      ...(typeof value.purchase.platform === 'string' ? { platform: value.purchase.platform } : {}),
      ...(typeof value.purchase.date === 'string' ? { date: value.purchase.date } : {}),
    } : {},
    arrival: isRecord(value.arrival) ? {
      ...(typeof value.arrival.expectedDate === 'string' || value.arrival.expectedDate === null ? { expectedDate: value.arrival.expectedDate } : {}),
      ...(typeof value.arrival.receivedDate === 'string' || value.arrival.receivedDate === null ? { receivedDate: value.arrival.receivedDate } : {}),
    } : {},
    afterSales: isRecord(value.afterSales) ? {
      ...(typeof value.afterSales.status === 'string' ? { status: value.afterSales.status } : {}),
      ...(typeof value.afterSales.note === 'string' ? { note: value.afterSales.note } : {}),
    } : {},
    images: images as Item['images'],
  };
}
function validateVersion(value: unknown): VersionData { assertRecord(value, 'version.json'); if (typeof value.version !== 'string' || !VERSION_RE.test(value.version)) throw dataError('version.json version 格式無效'); return { version: value.version }; }
function deepFreeze<T>(value: T): T { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Reflect.ownKeys(value as object).forEach(key => { const child = (value as Record<PropertyKey, unknown>)[key]; if (child && typeof child === 'object') deepFreeze(child); }); Object.freeze(value); } return value; }
function cloneAndFreeze<T>(value: T): T { return deepFreeze(structuredClone(value)); }
function normalizeStoreItem(item: Item, label: string): Item { return { ...item, quantity: normalizeQuantity(item.quantity, label) }; }
function readSavedUi(): UiState { try { const raw = localStorage.getItem('merch-ui'); if (!raw) return { ...defaultUiState }; const parsed = JSON.parse(raw) as Partial<UiState>; return { collectionView: parsed.collectionView === 'list' ? 'list' : 'cards', collectionQuery: typeof parsed.collectionQuery === 'string' ? parsed.collectionQuery : '', collectionStatus: typeof parsed.collectionStatus === 'string' ? parsed.collectionStatus : 'all', collectionWork: typeof parsed.collectionWork === 'string' ? parsed.collectionWork : 'all', collectionCategory: typeof parsed.collectionCategory === 'string' ? parsed.collectionCategory : 'all', collectionCharacter: typeof parsed.collectionCharacter === 'string' ? parsed.collectionCharacter : 'all', collectionManufacturer: typeof parsed.collectionManufacturer === 'string' ? parsed.collectionManufacturer : 'all', collectionSort: parsed.collectionSort === 'title' || parsed.collectionSort === 'price' ? parsed.collectionSort : 'created' }; } catch { return { ...defaultUiState }; } }

async function loadNewStaticData(index: WorksIndex): Promise<Work[]> {
  const works: Work[] = [];
  for (const entry of index.works) {
    const rootPath = entry.path.replace(/^\//, '').replace(/\/$/, '');
    const categoriesResponse = await fetch(`./${rootPath}/categories.json`, { cache: 'no-store' });
    let categories: string[] = [];
    if (categoriesResponse.ok) {
      const payload = await categoriesResponse.json() as unknown;
      if (isRecord(payload) && Array.isArray(payload.categories)) categories = payload.categories.filter((x): x is string => typeof x === 'string');
    }
    if (!categories.length) {
      const known = ['b','c','d','e','f','g','h','k','l','m','n','o','p','q','r','s','v','w','y'];
      categories = known;
    }
    const items: Item[] = [];
    for (const category of categories) {
      const response = await fetch(`./${rootPath}/${category}/index.json`, { cache: 'no-store' });
      if (!response.ok) continue;
      const payload = await response.json() as unknown;
      if (!isRecord(payload) || !Array.isArray(payload.items)) throw dataError(`類型索引格式無效：${entry.id}/${category}`);
      const categoryIndex = payload as unknown as CategoryIndex;
      for (const indexed of categoryIndex.items) {
        if (!indexed || typeof indexed.path !== 'string') throw dataError(`類型索引 Item path 無效：${entry.id}/${category}`);
        const itemResponse = await fetch(`./${indexed.path.replace(/^\//, '')}`, { cache: 'no-store' });
        if (!itemResponse.ok) throw httpError(indexed.path, itemResponse.status);
        items.push(validateItem(await itemResponse.json(), indexed.path, entry));
      }
    }
    works.push({ id: entry.id, name: entry.name, code: entry.code, items });
  }
  return works;
}

export class MerchStore {
  private state: StoreState;
  private listeners = new Set<(state: StoreState) => void>();
  private writeQueue: Promise<void> = Promise.resolve();
  constructor(state: StoreState) { this.state = cloneAndFreeze(state); }
  get snapshot(): StoreState { return this.state; }
  subscribe(listener: (state: StoreState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  setUi(patch: Partial<UiState>): void { const ui = { ...this.state.ui, ...patch }; this.state = cloneAndFreeze({ ...this.state, ui }); try { localStorage.setItem('merch-ui', JSON.stringify(ui)); } catch {} this.emit(); }
  replaceData(works: Work[], version: string): void { const normalizedWorks = works.map(work => ({ ...work, items: work.items.map((item, index) => normalizeStoreItem({ ...item, workId: work.id, workName: work.name }, `${work.name}.items[${index}]`)) })); const items = normalizedWorks.flatMap(work => work.items.map(item => ({ ...item, workId: work.id, workName: work.name }))); this.state = cloneAndFreeze({ ...this.state, works: normalizedWorks, items, version, loading: false, error: null }); this.emit(); }
  private applyRemote(data: { works: Work[]; version: string }): void { this.replaceData(data.works, data.version); }
  private enqueueWrite<T>(operation: () => Promise<T>): Promise<T> { const run = this.writeQueue.then(operation, operation); this.writeQueue = run.then(() => undefined, () => undefined); return run; }
  async addItem(item: Item): Promise<void> { return this.enqueueWrite(async () => { const work = this.state.works.find(entry => entry.id === item.workId); if (!work) throw dataError(`找不到收藏所屬作品：${item.workId}`); const normalized = normalizeStoreItem({ ...item, workId: work.id, workName: work.name }, `item ${item.id}`); const parsed = parseItemId(normalized.id); if (!parsed || parsed.workCode !== work.code) throw dataError(`Item ID 與作品不一致：${normalized.id}`); if (this.state.items.some(entry => entry.id === normalized.id)) throw dataError(`Item ID 已存在：${normalized.id}`); const data = await putItem(normalized); this.applyRemote(data); }); }
  async updateItem(item: Item): Promise<void> { return this.enqueueWrite(async () => { const current = this.state.items.find(entry => entry.id === item.id); if (!current) throw dataError(`找不到收藏：${item.id}`); const work = this.state.works.find(entry => entry.id === current.workId); if (!work) throw dataError(`找不到收藏所屬作品：${current.workId}`); const normalized = normalizeStoreItem({ ...item, workId: work.id, workName: work.name }, `item ${item.id}`); if (parseItemId(normalized.id)?.workCode !== work.code) throw dataError(`Item ID 與作品不一致：${normalized.id}`); const data = await putItem(normalized); this.applyRemote(data); }); }
  async deleteItem(id: string): Promise<void> { return this.enqueueWrite(async () => { const current = this.state.items.find(entry => entry.id === id); if (!current) throw dataError(`找不到收藏：${id}`); const data = await deleteRemoteItem(id); this.applyRemote(data); }); }
  setLoading(loading: boolean): void { this.state = cloneAndFreeze({ ...this.state, loading }); this.emit(); }
  setError(error: string | null): void { this.state = cloneAndFreeze({ ...this.state, error, loading: false }); this.emit(); }
  private emit(): void { this.listeners.forEach(listener => listener(this.state)); }
}

let sharedStorePromise: Promise<MerchStore> | null = null;
export function loadStore(): Promise<MerchStore> {
  if (sharedStorePromise) return sharedStorePromise;
  sharedStorePromise = (async () => {
    const store = new MerchStore({ works: [], items: [], version: '0.0.0', ui: readSavedUi(), loading: true, error: null });
    try {
      try { const remote = await getRemoteData(); store.replaceData(remote.works, remote.version); return store; } catch { /* API 尚未切換時使用靜態來源。 */ }
      const indexResponse = await fetch('./data/works.json', { cache: 'no-store' });
      if (!indexResponse.ok) throw httpError('works.json', indexResponse.status);
      const index = validateWorksIndex(await indexResponse.json());
      const works = index.schemaVersion === 2 ? await loadNewStaticData(index) : await Promise.all(index.works.map(async entry => { const response = await fetch(`./${entry.path}`, { cache: 'no-store' }); if (!response.ok) throw httpError(entry.path, response.status); const payload = await response.json() as unknown; assertRecord(payload, entry.path); if (!Array.isArray(payload.items)) throw dataError(`${entry.path}.items 必須是陣列`); return { id: entry.id, name: entry.name, code: entry.code, items: payload.items.map((item, i) => validateItem(item, `${entry.path}.items[${i}]`, entry)) } satisfies Work; }));
      const allIds = new Set<string>(); works.forEach(work => work.items.forEach(item => { if (allIds.has(item.id)) throw dataError(`所有作品存在重複 Item ID：${item.id}`); allIds.add(item.id); }));
      const versionResponse = await fetch('./data/version.json', { cache: 'no-store' }); if (!versionResponse.ok) throw httpError('version.json', versionResponse.status); const version = validateVersion(await versionResponse.json()).version; store.replaceData(works, version); return store;
    } catch (error) { const appError = toAppError(error, '資料載入失敗'); store.setError(appError.message); sharedStorePromise = null; throw Object.assign(new Error(appError.message), { store, code: appError.code, cause: appError.cause }); }
  })();
  return sharedStorePromise;
}
export const getStore = loadStore;
