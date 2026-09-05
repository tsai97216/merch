#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const [, , inputArg, outputArg = 'public/data/migrated'] = process.argv;

if (!inputArg) {
  console.error('用法：node scripts/migrate.mjs <legacy.json> [outputDir]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputDir = path.resolve(outputArg);

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmptyString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 必須是非空字串`);
  return value;
};

function normalizeQuantity(value, label) {
  if (value === undefined) return 1;
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label}.quantity 必須是大於等於 1 的整數`);
  return value;
}

function normalizeImage(image, index, itemId) {
  if (!isRecord(image)) throw new Error(`${itemId}.images[${index}] 必須是物件`);
  const id = nonEmptyString(image.id ?? image.path ?? `image-${index + 1}`, `${itemId}.images[${index}].id`);
  const result = { ...image, id };
  if (result.sha !== undefined) nonEmptyString(result.sha, `${itemId}.images[${index}].sha`);
  return result;
}

function normalizeItem(raw, work) {
  if (!isRecord(raw)) throw new Error(`作品 ${work.id} 的收藏品必須是物件`);
  const id = nonEmptyString(raw.id, 'item.id');
  const title = nonEmptyString(raw.title ?? raw.name, `${id}.title`);
  const status = nonEmptyString(raw.status ?? 'pending', `${id}.status`);
  const images = Array.isArray(raw.images) ? raw.images.map((image, index) => normalizeImage(image, index, id)) : raw.images;

  return {
    ...raw,
    id,
    workId: work.id,
    workName: work.name,
    title,
    quantity: normalizeQuantity(raw.quantity, id),
    status,
    ...(images ? { images } : {}),
  };
}

function normalizeWork(raw) {
  if (!isRecord(raw)) throw new Error('作品資料必須是物件');
  const id = nonEmptyString(raw.id, 'work.id');
  const name = nonEmptyString(raw.name, `${id}.name`);
  const code = nonEmptyString(raw.code, `${id}.code`);
  if (!Array.isArray(raw.items)) throw new Error(`${id}.items 必須是陣列`);

  const ids = new Set();
  const items = raw.items.map((item) => {
    const normalized = normalizeItem(item, { id, name });
    if (ids.has(normalized.id)) throw new Error(`${id} 存在重複 Item ID：${normalized.id}`);
    ids.add(normalized.id);
    return normalized;
  });

  return { id, name, code, items };
}

const raw = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const sourceWorks = Array.isArray(raw) ? raw : raw.works;
if (!Array.isArray(sourceWorks)) throw new Error('輸入資料必須是作品陣列，或包含 works 陣列的物件');

const works = sourceWorks.map(normalizeWork);
const allIds = new Set();
for (const work of works) {
  for (const item of work.items) {
    if (allIds.has(item.id)) throw new Error(`跨作品存在重複 Item ID：${item.id}`);
    allIds.add(item.id);
  }
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'works.json'), JSON.stringify({ schemaVersion: 1, works: works.map(({ items, ...work }) => ({ ...work, data: `data/works/${work.id}.json` })) }, null, 2) + '\n');
for (const work of works) {
  await fs.mkdir(path.join(outputDir, 'works'), { recursive: true });
  await fs.writeFile(path.join(outputDir, 'works', `${work.id}.json`), JSON.stringify({ schemaVersion: 1, work: { id: work.id, name: work.name }, items: work.items }, null, 2) + '\n');
}

console.log(`Migration 完成：${works.length} 個作品、${allIds.size} 個收藏品`);
console.log(`輸出：${outputDir}`);
