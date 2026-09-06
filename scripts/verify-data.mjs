#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const fail = (message) => { throw new Error(message); };
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const index = await readJson('public/data/works.json');
if (!isRecord(index) || index.schemaVersion !== 1 || !Array.isArray(index.works)) fail('works.json 格式無效。');

const version = await readJson('public/data/version.json');
const packageJson = await readJson('package.json');
if (typeof version.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version.version)) fail('version.json 版本格式無效。');
if (packageJson.version !== version.version) fail(`版本不同步：package.json=${packageJson.version}, version.json=${version.version}`);

const allIds = new Set();
let recordCount = 0;
let physicalQuantity = 0;

for (const entry of index.works) {
  if (!isRecord(entry)) fail('作品索引包含無效項目。');
  if (typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.code !== 'string' || typeof entry.data !== 'string') fail(`作品索引格式無效：${entry.id ?? '<unknown>'}`);
  const relative = entry.data.replace(/^\//, '');
  const file = relative.startsWith('data/') ? `public/${relative}` : relative;
  const payload = await readJson(file);
  if (!isRecord(payload) || !Array.isArray(payload.items)) fail(`作品資料格式無效：${entry.id}`);
  if (payload.work !== entry.id) fail(`作品 ID 不一致：${entry.id}`);
  if (payload.name !== entry.code) fail(`作品代碼不一致：${entry.id}`);

  const localIds = new Set();
  for (const item of payload.items) {
    if (!isRecord(item)) fail(`收藏資料不是物件：${entry.id}`);
    if (typeof item.id !== 'string' || !/^([A-Z]{2,3})[a-z]\d{3}$/.test(item.id)) fail(`Item ID 格式無效：${item.id ?? '<unknown>'}`);
    if (localIds.has(item.id) || allIds.has(item.id)) fail(`發現重複 Item ID：${item.id}`);
    localIds.add(item.id);
    allIds.add(item.id);
    if (item.workId !== entry.id) fail(`workId 不一致：${item.id}`);
    if (typeof item.title !== 'string' || !item.title.trim()) fail(`缺少標題：${item.id}`);
    const quantity = item.quantity === undefined ? 1 : item.quantity;
    if (!Number.isInteger(quantity) || quantity < 1) fail(`quantity 無效：${item.id}`);
    if (item.images !== undefined) {
      if (!Array.isArray(item.images)) fail(`images 必須是陣列：${item.id}`);
      let covers = 0;
      const imageIds = new Set();
      for (const image of item.images) {
        if (!isRecord(image) || typeof image.id !== 'string' || !image.id.trim()) fail(`圖片 metadata 無效：${item.id}`);
        if (imageIds.has(image.id)) fail(`圖片 ID 重複：${image.id}`);
        imageIds.add(image.id);
        if (image.isCover === true) covers += 1;
        if (image.sha !== undefined && (typeof image.sha !== 'string' || !image.sha.trim())) fail(`圖片 SHA 無效：${image.id}`);
        if (image.path !== undefined && (typeof image.path !== 'string' || !image.path.trim())) fail(`圖片 path 無效：${image.id}`);
      }
      if (covers > 1) fail(`一個收藏不能有多個封面：${item.id}`);
    }
    recordCount += 1;
    physicalQuantity += quantity;
  }
}

console.log(`Data verification passed: ${index.works.length} works, ${recordCount} item records, ${physicalQuantity} physical items, version ${version.version}.`);
