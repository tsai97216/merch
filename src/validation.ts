import type { ShippingRecord } from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function isValidImage(value: unknown): boolean {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim() || typeof value.file !== 'string' || !value.file.trim()) return false;
  if (value.alt !== undefined && typeof value.alt !== 'string') return false;
  if (value.isCover !== undefined && typeof value.isCover !== 'boolean') return false;
  if (value.sha !== undefined && typeof value.sha !== 'string') return false;
  if (value.url !== undefined && typeof value.url !== 'string') return false;
  if (value.path !== undefined && typeof value.path !== 'string') return false;
  return true;
}

export function isValidItem(value: unknown): boolean {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim() || typeof value.workId !== 'string' || !value.workId.trim() || typeof value.title !== 'string' || !isStringArray(value.series) || !isStringArray(value.characters) || typeof value.category !== 'string' || !value.category.trim() || typeof value.manufacturer !== 'string' || typeof value.quantity !== 'number' || !Number.isInteger(value.quantity) || value.quantity < 1 || typeof value.status !== 'string' || !value.status.trim() || typeof value.description !== 'string' || typeof value.notes !== 'string' || !isRecord(value.purchase) || !isRecord(value.arrival) || !isRecord(value.afterSales) || !Array.isArray(value.images) || !value.images.every(isValidImage)) return false;
  if (value.purchase.price !== undefined && (typeof value.purchase.price !== 'number' || !Number.isFinite(value.purchase.price) || value.purchase.price < 0)) return false;
  for (const field of ['currency', 'platform', 'date']) if (value.purchase[field] !== undefined && typeof value.purchase[field] !== 'string') return false;
  for (const field of ['expectedDate', 'receivedDate']) if (value.arrival[field] !== undefined && value.arrival[field] !== null && typeof value.arrival[field] !== 'string') return false;
  for (const field of ['status', 'note']) if (value.afterSales[field] !== undefined && typeof value.afterSales[field] !== 'string') return false;
  const imageIds = new Set<string>();
  for (const image of value.images as Array<Record<string, unknown>>) {
    if (imageIds.has(image.id as string)) return false;
    imageIds.add(image.id as string);
  }
  if (value.workName !== undefined && typeof value.workName !== 'string') return false;
  return true;
}

export function isValidShipping(value: unknown): value is ShippingRecord {
  return isRecord(value) && typeof value.id === 'string' && value.id.trim() !== '' && typeof value.amount === 'number' && Number.isFinite(value.amount) && value.amount >= 0 && typeof value.currency === 'string' && value.currency.trim() !== '' && (value.date === undefined || typeof value.date === 'string') && (value.carrier === undefined || typeof value.carrier === 'string') && (value.note === undefined || typeof value.note === 'string') && Array.isArray(value.itemIds) && value.itemIds.length > 0 && value.itemIds.every(itemId => typeof itemId === 'string' && itemId.trim() !== '');
}
