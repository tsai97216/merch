import { loadVersion, loadWorkData, loadWorks } from './data.ts';
import type { AppState, MerchItem } from './types.ts';

type Listener = (state: AppState) => void;

const state: AppState = {
  works: [],
  items: [],
  version: null,
  loading: true,
  error: null,
};

const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener({ ...state, works: [...state.works], items: [...state.items] });
}

export const store = {
  getState(): AppState {
    return { ...state, works: [...state.works], items: [...state.items] };
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async load(): Promise<void> {
    state.loading = true;
    state.error = null;
    notify();

    try {
      const [worksFile, version] = await Promise.all([loadWorks(), loadVersion()]);
      const datasets = await Promise.all(worksFile.works.map((work) => loadWorkData(work.data)));
      state.works = worksFile.works;
      state.items = datasets.flatMap((dataset) => dataset.items);
      state.version = version;
      state.error = null;
    } catch (error) {
      state.error = error instanceof Error ? error.message : '未知資料載入錯誤';
    } finally {
      state.loading = false;
      notify();
    }
  },

  findItem(id: string): MerchItem | undefined {
    return state.items.find((item) => item.id === id);
  },

  findWork(id: string) {
    return state.works.find((work) => work.id === id);
  },
};
