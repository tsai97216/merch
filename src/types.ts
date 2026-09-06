export type ItemStatus = string;

export type ImageMeta = {
  id: string;
  file: string;
  alt?: string;
  isCover?: boolean;
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

export type Item = {
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

export type Category = {
  code: string;
  name: string;
  aliases: string[];
};

export type CategoriesData = {
  categories: Category[];
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
  path: string;
};

export type CategoryIndexEntry = {
  id: string;
  path: string;
  title: string;
  characters: string[];
  manufacturer: string;
  quantity: number;
  status: string;
  cover?: string;
};

export type CategoryIndex = {
  schemaVersion: number;
  workId: string;
  category: string;
  items: CategoryIndexEntry[];
};

export type ItemData = Item;

export type WorksIndex = {
  schemaVersion: number;
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
