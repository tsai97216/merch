import type {
  Item,
  StoreState,
  UiState,
  VersionData,
  Work,
  WorkPayload,
  WorksIndex,
  WorksIndexEntry,
} from './types';
import { defaultUiState } from './types';
import { parseItemId } from './item-id';

const VERSION_RE = /^\d+\.\d+\.\d+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} 必須是物件`);
}

function validateWorksIndex(value: unknown): WorksIndex {
  assertRecord(value, 'works.json');
  if (value.schemaVersion !== 1) throw new Error('works.json schemaVersion 不支援');
  if (!Array.isArray(value.works)) throw new Error('works.json works 必須是陣列');

  const works: WorksIndexEntry[] = value.works.map((entry, index) => {
    assertRecord(entry, `works[${index}]`);
    if (typeof entry.id !== 'string' || !entry.id) throw new Error(`works[${index}].id 無效`);
    if (typeof entry.name !== 'string' || !entry.name) throw new Error(`works[${index}].name 無效`);
    if (typeof entry.code !== 'string' || !/^[A-Z]{2,3}$/.test(entry.code)) throw new Error(`works[${index}].code 必須是 2～3 碼大寫作品代碼`);
    if (typeof entry.data !== 'string' || !entry.data || entry.data.includes('..')) throw new Error(`works[${index}].data 無效`);
    return { id: entry.id, name: entry.name, code: entry.code, data: entry.data };
  });

  const workCodes = new Set<string>();
  works.forEach((work) => {
    if (workCodes.has(work.code)) throw new Error(`works.json 存在重複作品代碼：${work.code}`);
    workCodes.add(work.code);
  });

  return { schemaVersion: 1, works };
}

function normalizeQuantity(value: unknown, label: string): number {
  if (value === undefined) return 1;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`${label}.quantity 必須是大於等於 1 的整數`);
  }
  return value;
}

function validateItem(value: unknown, label: string, work: WorksIndexEntry): Item {
  assertRecord(value, label);
  if (typeof value.id !== 'string' || !value.id) throw new Error(`${label}.id 無效`);
  if (typeof value.title !== 'string' || !value.title) throw new Error(`${label}.title 無效`);
  if (typeof value.status !== 'string' || !value.status) throw new Error(`${label}.status 無效`);

  const id = parseItemId(value.id);
  if (!id) throw new Error(`${label}.id 不符合永久 Item ID 格式：${value.id}`);
  if (id.workCode !== work.code) throw new Error(`${label}.id 作品代碼 ${id.workCode} 與資料作品 ${work.code} 不一致`);

  if (value.characters !== undefined && (!Array.isArray(value.characters) || value.characters.some((x) => typeof x !== 'string'))) {
    throw new Error(`${label}.characters 格式無效`);
  }
  if (value.images !== undefined && (!Array.isArray(value.images) || value.images.some((x) => !isRecord(x) || typeof x.id !== 'string'))) {
    throw new Error(`${label}.images 格式無效`);
  }

  return { ...(value as unknown as Item), quantity: normalizeQuantity(value.quantity, label) };
}

function validateWorkPayload(value: unknown, label: string, work: WorksIndexEntry): WorkPayload {
  assertRecord(value, label);
  if (value.schemaVersion !== undefined && value.schemaVersion !== 1) throw new Error(`${label} schemaVersion 不支援`);
  if (!Array.isArray(value.items)) throw new Error(`${label}.items 必須是陣列`);
  const items = value.items.map((item, index) => validateItem(item, `${label}.items[${index}]`, work));
  const ids = new Set<string>();
  const groups = new Set<string>();
  items.forEach((item) => {
    if (ids.has(item.id)) throw new Error(`${label} 存在重複 Item ID：${item.id}`);
    ids.add(item.id);

    const parsed = parseItemId(item.id);
    if (parsed) {
      const groupKey = `${parsed.workCode}${parsed.categoryCode}${parsed.sequence}`;
      if (groups.has(groupKey)) throw new Error(`${label} 存在重複永久流水號：${item.id}`);
      groups.add(groupKey);
    }
  });
  return { schemaVersion: 1, work: { id: work.id, name: work.name }, items };
}

function validateVersion(value: unknown): VersionData {
  assertRecord(value, 'version.json');
  if (typeof value.version !== 'string' || !VERSION_RE.test(value.version)) throw new Error('version.json version 格式無效');
  return { version: value.version };
}

function readSavedUi(): UiState {
  try {
    const raw = localStorage.getItem('merch-ui');
    if (!raw) return { ...defaultUiState };
    const parsed = JSON.parse(raw) as Partial<UiState>;
    return {
      collectionView: parsed.collectionView === 'list' ? 'list' : 'cards',
      collectionQuery: typeof parsed.collectionQuery === 'string' ? parsed.collectionQuery : '',
      collectionStatus: typeof parsed.collectionStatus === 'string' ? parsed.collectionStatus : 'all',
      collectionWork: typeof parsed.collectionWork === 'string' ? parsed.collectionWork : 'all',
      collectionCategory: typeof parsed.collectionCategory === 'string' ? parsed.collectionCategory : 'all',
      collectionCharacter: typeof parsed.collectionCharacter === 'string' ? parsed.collectionCharacter : 'all',
      collectionManufacturer: typeof parsed.collectionManufacturer === 'string' ? parsed.collectionManufacturer : 'all',
      collectionSort: parsed.collectionSort === 'title' || parsed.collectionSort === 'price' ? parsed.collectionSort : 'created',
    };
  } catch {
    return { ...defaultUiState };
  }
}

export class MerchStore {
  private state: StoreState;
  private listeners = new Set<(state: StoreState) => void>();

  constructor(state: StoreState) {
    this.state = Object.freeze({ ...state, works: [...state.works], items: [...state.items], ui: { ...state.ui } });
  }

  get snapshot(): StoreState {
    return this.state;
  }

  subscribe(listener: (state: StoreState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setUi(patch: Partial<UiState>): void {
    const ui = { ...this.state.ui, ...patch };
    this.state = Object.freeze({ ...this.state, ui });
    try { localStorage.setItem('merch-ui', JSON.stringify(ui)); } catch { /* local persistence is optional */ }
    this.emit();
  }

  replaceData(works: Work[], version: string): void {
    const normalizedWorks = works.map((work) => ({
      ...work,
      items: work.items.map((item) => ({ ...item, quantity: item.quantity || 1 })),
    }));
    const items = normalizedWorks.flatMap((work) => work.items.map((item) => ({ ...item, workId: work.id, workName: work.name })));
    this.state = Object.freeze({ ...this.state, works: normalizedWorks, items, version, loading: false, error: null });
    this.emit();
  }

  setLoading(loading: boolean): void {
    this.state = Object.freeze({ ...this.state, loading });
    this.emit();
  }

  setError(error: string | null): void {
    this.state = Object.freeze({ ...this.state, error, loading: false });
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export async function loadStore(): Promise<MerchStore> {
  const store = new MerchStore({
    works: [],
    items: [],
    version: '0.0.0',
    ui: readSavedUi(),
    loading: true,
    error: null,
  });

  try {
    const indexResponse = await fetch('./data/works.json', { cache: 'no-store' });
    if (!indexResponse.ok) throw new Error(`works.json ${indexResponse.status}`);
    const index = validateWorksIndex(await indexResponse.json());

    const works = await Promise.all(index.works.map(async (entry) => {
      const response = await fetch(`./${entry.data}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${entry.data} ${response.status}`);
      const payload = validateWorkPayload(await response.json(), entry.data, entry);
      return { id: entry.id, name: entry.name, code: entry.code, items: payload.items } satisfies Work;
    }));

    const allIds = new Set<string>();
    works.forEach((work) => work.items.forEach((item) => {
      if (allIds.has(item.id)) throw new Error(`所有作品存在重複 Item ID：${item.id}`);
      allIds.add(item.id);
    }));

    const versionResponse = await fetch('./data/version.json', { cache: 'no-store' });
    if (!versionResponse.ok) throw new Error(`version.json ${versionResponse.status}`);
    const version = validateVersion(await versionResponse.json()).version;
    store.replaceData(works, version);
    return store;
  } catch (error) {
    const message = error instanceof Error ? error.message : '資料載入失敗';
    store.setError(message);
    throw Object.assign(new Error(message), { store });
  }
}
