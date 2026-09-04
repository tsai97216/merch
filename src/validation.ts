import type { MerchItem, VersionInfo, WorkData, WorksFile } from './types.ts';

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
  for (const key of ['id', 'path', 'url', 'sha', 'alt']) {
    requireString(value[key], `${path}.${key}`);
  }
  requireBoolean(value.isCover, `${path}.isCover`);
}

function validateItem(value: unknown, path: string): asserts value is MerchItem {
  requireObject(value, path);

  for (const key of ['id', 'workId', 'title', 'series', 'category', 'manufacturer', 'status', 'description', 'notes', 'createdAt', 'updatedAt']) {
    requireString(value[key], `${path}.${key}`);
  }

  const images = value.images;
  requireArray(images, `${path}.images`);
  images.forEach((image, index) => validateImage(image, `${path}.images[${index}]`));

  const characters = value.characters;
  requireArray(characters, `${path}.characters`);
  characters.forEach((character, index) => requireString(character, `${path}.characters[${index}]`));

  const purchase = value.purchase;
  requireObject(purchase, `${path}.purchase`);
  requireNumber(purchase.price, `${path}.purchase.price`);
  for (const key of ['currency', 'platform', 'date', 'url', 'orderId']) {
    requireString(purchase[key], `${path}.purchase.${key}`);
  }

  const release = value.release;
  requireObject(release, `${path}.release`);
  for (const key of ['date', 'expectedDate', 'receivedDate']) {
    requireString(release[key], `${path}.release.${key}`);
  }

  const shipping = value.shipping;
  requireObject(shipping, `${path}.shipping`);
  for (const key of ['status', 'method', 'trackingNumber', 'note']) {
    requireString(shipping[key], `${path}.shipping.${key}`);
  }

  const afterSales = value.afterSales;
  requireObject(afterSales, `${path}.afterSales`);
  for (const key of ['status', 'note', 'updatedAt']) {
    requireString(afterSales[key], `${path}.afterSales.${key}`);
  }
}

export function validateWorksFile(value: unknown): asserts value is WorksFile {
  requireObject(value, 'works.json');
  requireNumber(value.schemaVersion, 'works.json.schemaVersion');

  const works = value.works;
  requireArray(works, 'works.json.works');

  const ids = new Set<string>();
  works.forEach((work, index) => {
    const path = `works.json.works[${index}]`;
    requireObject(work, path);

    const id = work.id;
    const name = work.name;
    const data = work.data;
    requireString(id, `${path}.id`);
    requireString(name, `${path}.name`);
    requireString(data, `${path}.data`);

    if (ids.has(id)) fail(`${path}.id`, '工作 ID 重複');
    ids.add(id);

    if (!data.startsWith('data/') || !data.endsWith('/data.json')) {
      fail(`${path}.data`, '資料路徑格式無效');
    }
  });
}

export function validateWorkData(value: unknown): asserts value is WorkData {
  requireObject(value, 'work data');
  requireNumber(value.schemaVersion, 'work data.schemaVersion');

  for (const key of ['work', 'name', 'updatedAt']) {
    requireString(value[key], `work data.${key}`);
  }

  const workId = value.work;
  const items = value.items;
  requireString(workId, 'work data.work');
  requireArray(items, 'work data.items');

  const ids = new Set<string>();
  items.forEach((rawItem, index) => {
    const path = `work data.items[${index}]`;
    validateItem(rawItem, path);
    const item = rawItem;

    if (item.workId !== workId) {
      fail(`${path}.workId`, `必須等於 ${workId}`);
    }
    if (ids.has(item.id)) {
      fail(`${path}.id`, '項目 ID 重複');
    }
    ids.add(item.id);

    const covers = item.images.filter((image) => image.isCover);
    if (covers.length > 1) {
      fail(`${path}.images`, '最多只能有一張封面圖');
    }
  });
}

export function validateVersion(value: unknown): asserts value is VersionInfo {
  requireObject(value, 'version.json');
  const version = value.version;
  const updatedAt = value.updatedAt;
  requireString(version, 'version.json.version');
  requireString(updatedAt, 'version.json.updatedAt');
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail('version.json.version', '版本號必須符合 major.minor.patch');
  }
}
