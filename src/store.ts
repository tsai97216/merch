import { loadVersion, loadWorkData, loadWorks } from './data.ts';
import type { AppState, CollectionUIState, MerchItem } from './types.ts';
import { validateDataset } from './validation.ts';

const UI_STORAGE_KEY = 'chi-merch:collection-ui';

const defaultCollectionUI: CollectionUIState = {
  viewMode: 'card',
  search: '',
  status: '',
  category: '',
  character: '',
  manufacturer: '',
  workId: '',
  sort: 'updated-desc',
};

function loadSavedUI(): CollectionUIState {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return { ...defaultCollectionUI };
    const parsed = JSON.parse(raw) as Partial<CollectionUIState>;
    return {
      ...defaultCollectionUI,
      ...parsed,
      viewMode: parsed.viewMode === 'list' ? 'list' : 'card',
    };
  } catch {
    return { ...defaultCollectionUI };
  }
}

function saveUI(ui: CollectionUIState): void {
  try { localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(ui)); } catch { /* storage may be unavailable */ }
}

const initialState: AppState = {
  works: [],
  items: [],
  version: null,
  ui: { collection: loadSavedUI() },
  loading: true,
  error: null,
};

export type Listener = (state: AppState) => void;

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class Store {
  private state: AppState = clone(initialState);
  private readonly listeners = new Set<Listener>();
  private loadRequest = 0;

  getState(): AppState { return clone(this.state); }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private update(mutator: (state: AppState) => void): void {
    const next = clone(this.state);
    mutator(next);
    this.state = next;
    for (const listener of this.listeners) listener(this.getState());
  }

  setCollectionUI(patch: Partial<CollectionUIState>): void {
    this.update((state) => Object.assign(state.ui.collection, patch));
    saveUI(this.state.ui.collection);
  }

  async load(): Promise<void> {
    const request = ++this.loadRequest;
    this.update((state) => { state.loading = true; state.error = null; });
    try {
      const [worksFile, version] = await Promise.all([loadWorks(), loadVersion()]);
      const loaded = await Promise.all(worksFile.works.map(async (work) => loadWorkData(work.data)));
      if (request !== this.loadRequest) return;
      const items: MerchItem[] = loaded.flatMap((data) => data.items);
      validateDataset(worksFile.works, items);
      this.update((state) => {
        state.works = worksFile.works;
        state.items = items;
        state.version = version;
        state.loading = false;
        state.error = null;
      });
    } catch (error) {
      if (request !== this.loadRequest) return;
      const message = error instanceof Error ? error.message : '未知資料錯誤';
      this.update((state) => { state.loading = false; state.error = message; });
    }
  }

  findItem(id: string): MerchItem | undefined {
    return this.state.items.find((item) => item.id === id);
  }
}

export const store = new Store();
