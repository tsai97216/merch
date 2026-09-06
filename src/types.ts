export type ItemStatus = string;

export type ImageMeta = {
  id: string;
  /** Filename only. The physical path is always derived from the Item folder. */
  file: string;
  alt?: string;
  isCover?: boolean;
  /** Optional content hash retained for integrity verification. */
  sha?: string;
  /** Runtime compatibility for image records returned by older API responses. Never persisted by new storage. */
  url?: string;
  path?: string;
};

export type Purchase = {
  price?: number;
  currency?: string;
  platform?: string;
  date?: string;
};

export type Arrival = {
  expectedDate?: string | null;
  receivedDate?: string | null;
};

export type AfterSales = {
  status?: string;
  note?: string;
};

/** Canonical Item document stored at <item>/data.json. */
export type PersistedItem = {
  id: string;
  workId: string;
  title: string;
  series: string[];
  characters: string[];
  category: string;
  manufacturer: string;
  quantity: number;
  status: ItemStatus;
  description: string;
  notes: string;
  purchase: Purchase;
  arrival: Arrival;
  afterSales: AfterSales;
  images: ImageMeta[];
};

/** Runtime-only fields. These must never be written to data.json. */
export type RuntimeItemFields = {
  /** Human-readable work name injected by Store for UI rendering. */
  workName?: string;
};

/** UI Item. Persistence/API boundaries must use PersistedItem. */
export type Item = PersistedItem & RuntimeItemFields;

/** Storage locations belonging to one permanent Item ID. */
export type ItemStorage = {
  dataPath: string;
  imagesPath: string;
  categoryIndexPath: string;
};

export type Category = {
  code: string;
  name: string;
  aliases: string[];
};

export type CategoriesData = {
  categories: Category[];
};

/** Runtime/UI work. Storage does not persist the items array here. */
export type Work = {
  id: string;
  name: string;
  code: string;
  items: Item[];
};

export type WorksIndexEntry = {
  id: string;
  name: string;
  code: string;
  path: string;
};

/** Lightweight metadata kept in a category index. */
export type CategoryIndexEntry = {
  id: string;
  path: string;
  title: string;
  characters: string[];
  manufacturer: string;
  quantity: number;
  status: ItemStatus;
  cover?: string;
};

export type CategoryIndex = {
  schemaVersion: 1;
  workId: string;
  category: string;
  items: CategoryIndexEntry[];
};

/** Complete per-Item JSON document. */
export type ItemData = PersistedItem;

export type WorksIndex = {
  schemaVersion: 1 | 2;
  works: WorksIndexEntry[];
};

export type VersionData = {
  version: string;
};

export type UiState = {
  collectionView: 'cards' | 'list';
  collectionQuery: string;
  collectionStatus: string;
  collectionWork: string;
  collectionCategory: string;
  collectionCharacter: string;
  collectionManufacturer: string;
  collectionSort: 'created' | 'title' | 'price';
};

export type StoreState = {
  works: Work[];
  items: Item[];
  version: string;
  ui: UiState;
  loading: boolean;
  error: string | null;
};

export const defaultUiState: UiState = {
  collectionView: 'cards',
  collectionQuery: '',
  collectionStatus: 'all',
  collectionWork: 'all',
  collectionCategory: 'all',
  collectionCharacter: 'all',
  collectionManufacturer: 'all',
  collectionSort: 'created',
};
