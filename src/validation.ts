import type { MerchItem, VersionInfo, Work, WorkData, WorksFile } from './types.ts';

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}

function fail(path: string, message: string): never {
  throw new DataValidationError(`${path}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string') fail(path, '必須是字串');
}

function requireNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(path, '必須是有限數字');
}

function requireBoolean(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== 'boolean') fail(path, '必須是布林值');
}

function requireObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) fail(path, '必須是物件');
}

function requireArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) fail(path, '必須是陣列');
}

function validateImage(value: unknown, path: string): void {
  requireObject(value, path);
  for (const key of ['id', 'path', 'url', 'sha', 'alt']) requireString(value[key], `${path}.${key}`);
  requireBoolean(value.isCover, `${path}.isCover`);
}

function validateItem(value: unknown, path: string): asserts value is MerchItem {
  requireObject(value, path);
  for (const key of ['id', 'workId', 'title', 'series', 'category', 'manufacturer', 'status', 'description', 'notes', 'createdAt', 'updatedAt']) requireString(value[key], `${path}.${key}`);
  requireArray(value.images, `${path}.images`);
  value.images.forEach((image, index) => validateImage(image, `${path}.images[${index}]`));
  requireArray(value.characters, `${path}.characters`);
  value.characters.forEach((character, index) => requireString(character, `${path}.characters[${index}]`));

  requireObject(value.purchase, `${path}.purchase`);
  requireNumber(value.purchase.price, `${path}.purchase.price`);
  for (const key of ['currency', 'platform', 'date', 'url', 'orderId']) requireString(value.purchase[key], `${path}.purchase.${key}`);
  requireObject(value.release, `${path}.release`);
  for (const key of ['date', 'expectedDate', 'receivedDate']) requireString(value.release[key], `${path}.release.${key}`);
  requireObject(value.shipping, `${path}.shipping`);
  for (const key of ['status', 'method', 'trackingNumber', 'note']) requireString(value.shipping[key], `${path}.shipping.${key}`);
  requireObject(value.afterSales, `${path}.afterSales`);
  for (const key of ['status', 'note', 'updatedAt']) requireString(value.afterSales[key], `${path}.afterSales.${key}`);
}

export function validateWorksFile(value: unknown): asserts value is WorksFile {
  requireObject(value, 'works.json');
  requireNumber(value.schemaVersion, 'works.json.schemaVersion');
  requireArray(value.works, 'works.json.works');
  const ids = new Set<string>();
  value.works.forEach((work, index) => {
    const path = `works.json.works[${index}]`;
    requireObject(work, path);
    requireString(work.id, `${path}.id`); requireString(work.name, `${path}.name`); requireString(work.data, `${path}.data`);
    if (ids.has(work.id)) fail(`${path}.id`, '工作 ID 重複');
    ids.add(work.id);
    if (!work.data.startsWith('data/') || !work.data.endsWith('/data.json')) fail(`${path}.data`, '資料路徑格式無效');
  });
}

export function validateWorkData(value: unknown): asserts value is WorkData {
  requireObject(value, 'work data');
  requireNumber(value.schemaVersion, 'work data.schemaVersion');
  for (const key of ['work', 'name', 'updatedAt']) requireString(value[key], `work data.${key}`);
  requireArray(value.items, 'work data.items');
  const ids = new Set<string>();
  value.items.forEach((rawItem, index) => {
    const path = `work data.items[${index}]`;
    validateItem(rawItem, path);
    if (rawItem.workId !== value.work) fail(`${path}.workId`, `必須等於 ${value.work}`);
    if (ids.has(rawItem.id)) fail(`${path}.id`, '項目 ID 重複');
    ids.add(rawItem.id);
    if (rawItem.images.filter((image) => image.isCover).length > 1) fail(`${path}.images`, '最多只能有一張封面圖');
  });
}

export function validateVersion(value: unknown): asserts value is VersionInfo {
  requireObject(value, 'version.json');
  requireString(value.version, 'version.json.version');
  requireString(value.updatedAt, 'version.json.updatedAt');
  if (!/^\d+\.\d+\.\d+$/.test(value.version)) fail('version.json.version', '版本號必須符合 major.minor.patch');
}

export function validateDataset(works: Work[], items: MerchItem[]): void {
  const workIds = new Set(works.map((work) => work.id));
  const itemIds = new Set<string>();
  const imageShas = new Set<string>();
  for (const item of items) {
    if (!workIds.has(item.workId)) fail(`item.${item.id}.workId`, '指向不存在的作品');
    if (itemIds.has(item.id)) fail(`item.${item.id}`, '項目 ID 重複');
    itemIds.add(item.id);
    for (const image of item.images) {
      if (imageShas.has(image.sha)) fail(`image.${image.id}.sha`, '圖片 SHA 重複');
      imageShas.add(image.sha);
    }
  }
}
