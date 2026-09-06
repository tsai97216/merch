#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const fail = (message) => { throw new Error(message); };
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const categoryData = await readJson('public/data/categories.json');
if (!isRecord(categoryData) || !Array.isArray(categoryData.categories)) fail('categories.json 格式無效。');
const categoryCodes = new Set();
for (const category of categoryData.categories) {
  if (!isRecord(category) || !/^[a-z]$/.test(category.code) || !nonEmptyString(category.name) || !Array.isArray(category.aliases)) {
    fail('categories.json 存在無效類型。');
  }
  if (categoryCodes.has(category.code)) fail(`類型 code 重複：${category.code}`);
  categoryCodes.add(category.code);
}

const index = await readJson('data/works.json');
if (!isRecord(index) || index.schemaVersion !== 2 || !Array.isArray(index.works)) fail('新 works.json 格式無效。');

const allIds = new Set();
let itemCount = 0;
let physicalQuantity = 0;
let imageCount = 0;

for (const work of index.works) {
  if (!isRecord(work) || !nonEmptyString(work.id) || !nonEmptyString(work.name) || !nonEmptyString(work.code) || work.path !== `data/${work.id}`) {
    fail(`作品索引格式無效：${work?.id ?? '<unknown>'}`);
  }
  const workRoot = path.join(root, work.path.replace(/^data\//, 'data/'));
  const workEntries = await fs.readdir(workRoot, { withFileTypes: true });
  for (const categoryDir of workEntries.filter((entry) => entry.isDirectory())) {
    const category = categoryDir.name;
    if (!categoryCodes.has(category)) fail(`未註冊的類型目錄：${work.id}/${category}`);
    const categoryIndexPath = path.join(workRoot, category, 'index.json');
    const categoryIndex = JSON.parse(await fs.readFile(categoryIndexPath, 'utf8'));
    if (!isRecord(categoryIndex) || categoryIndex.schemaVersion !== 1 || categoryIndex.workId !== work.id || categoryIndex.category !== category || !Array.isArray(categoryIndex.items)) {
      fail(`Category index 無效：${work.id}/${category}`);
    }

    const indexedIds = new Set();
    for (const entry of categoryIndex.items) {
      if (!isRecord(entry) || !nonEmptyString(entry.id) || indexedIds.has(entry.id)) fail(`Category index Item 無效或重複：${work.id}/${category}`);
      indexedIds.add(entry.id);
      if (allIds.has(entry.id)) fail(`發現重複 Item ID：${entry.id}`);
      allIds.add(entry.id);
      if (entry.path !== `data/${work.id}/${category}/${entry.id}/data.json`) fail(`Item path 不一致：${entry.id}`);

      const itemDir = path.join(workRoot, category, entry.id);
      const item = await readJson(path.join(itemDir, 'data.json'));
      if (!isRecord(item)) fail(`Item data 無效：${entry.id}`);
      for (const key of ['id', 'workId', 'title', 'series', 'characters', 'category', 'manufacturer', 'quantity', 'status', 'description', 'notes', 'purchase', 'arrival', 'afterSales', 'images']) {
        if (!(key in item)) fail(`Item 缺少欄位：${entry.id}.${key}`);
      }
      if (item.id !== entry.id || item.workId !== work.id || item.category !== category) fail(`Item identity 不一致：${entry.id}`);
      if (!nonEmptyString(item.title) || !Array.isArray(item.series) || !Array.isArray(item.characters) || !nonEmptyString(item.category) || typeof item.manufacturer !== 'string') fail(`Item 基本資料無效：${entry.id}`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) fail(`Item quantity 無效：${entry.id}`);
      if (!isRecord(item.purchase) || !isRecord(item.arrival) || !isRecord(item.afterSales) || !Array.isArray(item.images)) fail(`Item 子結構無效：${entry.id}`);
      if ('shipping' in item || 'material' in item || 'release' in item || 'workName' in item || 'createdAt' in item || 'updatedAt' in item) fail(`Item 含有已淘汰欄位：${entry.id}`);

      const imageDir = path.join(itemDir, 'images');
      const imageFiles = (await fs.readdir(imageDir, { withFileTypes: true })).filter((file) => file.isFile()).map((file) => file.name);
      const metadataFiles = new Set();
      let covers = 0;
      for (const image of item.images) {
        if (!isRecord(image) || !nonEmptyString(image.id) || !nonEmptyString(image.file) || image.file !== path.basename(image.file)) fail(`圖片 metadata 無效：${entry.id}`);
        if (metadataFiles.has(image.file)) fail(`圖片檔案重複：${entry.id}/${image.file}`);
        metadataFiles.add(image.file);
        if (!imageFiles.includes(image.file)) fail(`找不到 Item 圖片檔案：${entry.id}/${image.file}`);
        if (image.isCover === true) covers += 1;
        imageCount += 1;
      }
      if (covers > 1) fail(`一個 Item 有多個封面：${entry.id}`);
      if (imageFiles.some((file) => !metadataFiles.has(file))) fail(`發現孤立圖片：${entry.id}`);

      itemCount += 1;
      physicalQuantity += item.quantity;
    }
  }
}

console.log(`New data verification passed: ${index.works.length} works, ${itemCount} item records, ${physicalQuantity} physical items, ${imageCount} images.`);
