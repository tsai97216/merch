export type ItemStatus = 'received' | 'preorder' | 'pending' | string;

export type ImageMeta = {
  id: string;
  path?: string;
  url?: string;
  sha?: string;
  alt?: string;
  isCover?: boolean;
};

export type Purchase = {
  price?: number;
  currency?: string;
  platform?: string;
  date?: string;
  url?: string;
  orderId?: string;
};

export type Release = {
  date?: string;
  expectedDate?: string;
  receivedDate?: string;
};

export type Shipping = {
  status?: string;
  method?: string;
  note?: string;
};

export type AfterSales = {
  status?: string;
  note?: string;
  updatedAt?: string;
};

export type Item = {
  id: string;
  workId: string;
  workName?: string;
  title: string;
  series?: string;
  characters?: string[];
  category?: string;
  manufacturer?: string;
  quantity: number;
  status: ItemStatus;
  description?: string;
  notes?: string;
  images?: ImageMeta[];
  purchase?: Purchase;
  release?: Release;
  shipping?: Shipping;
  afterSales?: AfterSales;
  createdAt?: string;
  updatedAt?: string;
};

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
  data: string;
};

export type WorksIndex = {
  schemaVersion: number;
  works: WorksIndexEntry[];
};

export type WorkPayload = {
  schemaVersion?: number;
  work?: { id?: string; name?: string };
  items: Item[];
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
