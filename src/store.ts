import { loadVersion, loadWorkData, loadWorks } from './data.ts';
import type { AppState, CollectionUIState, MerchItem } from './types.ts';
import { validateDataset } from './validation.ts';

const STORAGE_KEY = 'chi-merch:collection-ui';
const defaults: CollectionUIState = { viewMode:'card', search:'', status:'', category:'', character:'', manufacturer:'', workId:'', sort:'updated-desc' };

function readUI(): CollectionUIState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const value = JSON.parse(raw) as Partial<CollectionUIState>;
    return { ...defaults, ...value, viewMode:value.viewMode === 'list' ? 'list' : 'card' };
  } catch { return { ...defaults }; }
}

const initial: AppState = { works:[], items:[], version:null, ui:{ collection:readUI() }, loading:true, error:null };
export type Listener = (state: AppState) => void;

export class Store {
  private state: AppState = initial;
  private listeners = new Set<Listener>();
  private request = 0;

  getState(): AppState { return this.state; }
  subscribe(listener: Listener): () => void { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  private emit(): void { for (const listener of this.listeners) listener(this.state); }

  setCollectionUI(patch: Partial<CollectionUIState>): void {
    this.state = { ...this.state, ui:{ collection:{ ...this.state.ui.collection, ...patch } } };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.ui.collection)); } catch { /* ignore storage failures */ }
    this.emit();
  }

  async load(): Promise<void> {
    const request = ++this.request;
    this.state = { ...this.state, loading:true, error:null };
    this.emit();
    try {
      const [worksFile, version] = await Promise.all([loadWorks(), loadVersion()]);
      const datasets = await Promise.all(worksFile.works.map((work) => loadWorkData(work.data)));
      if (request !== this.request) return;
      const items: MerchItem[] = datasets.flatMap((d) => d.items);
      validateDataset(worksFile.works, items);
      this.state = { ...this.state, works:worksFile.works, items, version, loading:false, error:null };
    } catch (error) {
      if (request !== this.request) return;
      this.state = { ...this.state, loading:false, error:error instanceof Error ? error.message : '資料載入失敗' };
    }
    this.emit();
  }

  findItem(id: string): MerchItem | undefined { return this.state.items.find((item) => item.id === id); }
}

export const store = new Store();
