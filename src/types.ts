export type ItemStatus = 'received' | 'pending' | 'preorder' | string;

export interface ImageAsset {
  id: string;
  path: string;
  url: string;
  sha: string;
  alt: string;
  isCover: boolean;
}

export interface PurchaseInfo {
  price: number;
  currency: string;
  platform: string;
  date: string;
  url: string;
  orderId: string;
}

export interface ReleaseInfo {
  date: string;
  expectedDate: string;
  receivedDate: string;
}

export interface ShippingInfo {
  status: string;
  method: string;
  trackingNumber: string;
  note: string;
}

export interface AfterSalesInfo {
  status: string;
  note: string;
  updatedAt: string;
}

export interface MerchItem {
  id: string;
  images: ImageAsset[];
  workId: string;
  title: string;
  series: string;
  characters: string[];
  category: string;
  manufacturer: string;
  status: ItemStatus;
  description: string;
  notes: string;
  purchase: PurchaseInfo;
  release: ReleaseInfo;
  shipping: ShippingInfo;
  afterSales: AfterSalesInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Work {
  id: string;
  name: string;
  data: string;
}

export interface WorksFile {
  schemaVersion: number;
  works: Work[];
}

export interface WorkData {
  schemaVersion: number;
  work: string;
  name: string;
  updatedAt: string;
  items: MerchItem[];
}

export interface VersionInfo {
  version: string;
  updatedAt: string;
}

export interface AppState {
  works: Work[];
  items: MerchItem[];
  version: VersionInfo | null;
  loading: boolean;
  error: string | null;
}
