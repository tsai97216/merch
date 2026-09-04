import { loadVersion, loadWorkData, loadWorks } from './data.ts';
import type { AppState, CollectionUIState, MerchItem, UIState, Version, Work } from './types.ts';

export type StoreListener = (state: AppState) => void;

const initialUI: UIState = {
  collection: {
    viewMode: 'card',
    search: '',
    status: '',
    category: '',
    character: '',
    manufacturer: '',
    workId: '',
    sort: 'updated-desc',
  },
};

const state: AppState = {
  works: [],
  items: [],
  version: null,
  ui: initialUI,
  loading: true,
  error: null,
};

const listeners = new Set<StoreListener>();

function clone<T>(value: T): T {
  return structuredClone(value);
}

function snapshot(): AppState {
  return clone(state);
}

function notify(): void {
  const current = snapshot();
  for (const listener of listeners) listener(current);
}

function validateDataset(works: Work[], items: MerchItem[]): void {
  const workIds = new Set(works.map((work) => work.id));
  const itemIds = new Set<string>();
  const imageShas = new Set<string>();

  for (const item of items) {
    if (!workIds.has(item.workId)) {
      throw new Error(`資料一致性錯誤：項目 ${item.id} 指向不存在的作品 ${item.workId}`);
    }
    if (itemIds.has(item.id)) {
      throw new Error(`資料一致性錯誤：項目 ID 重複 ${item.id}`);
    }
    itemIds.add(item.id);

    for (const image of item.images) {
      if (image.sha && imageShas.has(image.sha)) {
        throw new Error(`資料一致性錯誤：圖片 SHA 重複 ${image.sha}`);
      }
      if (image.sha) imageShas.add(image.sha);
    }
  }
}

export const store = {
  getState(): AppState {
    return snapshot();
  },

  subscribe(listener: StoreListener): () => void {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  },

  setCollectionUI(patch: Partial<CollectionUIState>): void {
    state.ui = {
      ...state.ui,
      collection: {
        ...state.ui.collection,
        ...patch,
      },
    };
    notify();
  },

  setLoading(loading: boolean): void {
    state.loading = loading;
    notify();
  },

  setError(error: string | null): void {
    state.error = error;
    notify();
  },

  setData(works: Work[], items: MerchItem[], version: Version): void {
    validateDataset(works, items);
    state.works = clone(works);
    state.items = clone(items);
    state.version = clone(version);
    state.error = null;
    state.loading = false;
    notify();
  },

  async load(): Promise<void> {
    state.loading = true;
    state.error = null;
    notify();

    try {
      const [worksFile, version] = await Promise.all([loadWorks(), loadVersion()]);
      const datasets = await Promise.all(worksFile.works.map((work) => loadWorkData(work.data)));
      const items = datasets.flatMap((dataset) => dataset.items);
      validateDataset(worksFile.works, items);
      state.works = clone(worksFile.works);
      state.items = clone(items);
      state.version = clone(version);
      state.error = null;
    } catch (error) {
      state.error = error instanceof Error ? error.message : '未知資料載入錯誤';
    } finally {
      state.loading = false;
      notify();
    }
  },

  findItem(id: string): MerchItem | undefined {
    return snapshot().items.find((item) => item.id === id);
  },

  findWork(id: string): Work | undefined {
    return snapshot().works.find((work) => work.id === id);
  },
};
