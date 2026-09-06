#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dataArg = process.argv[2] || 'data';
const dataRoot = path.resolve(root, dataArg);
const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const readDataJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(dataRoot, relativePath), 'utf8'));
const fail = (message) => { throw new Error(message); };
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const IMAGE_RE = /^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const ITEM_ID_RE = /^([A-Z]{2,3})([a-z])(\d{3})$/;
const canonicalJson = (value) => JSON.stringify(value);
const sha256 = async (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(await fs.readFile(filePath));
  return hash.digest('hex');
};

const categoryData = await readJson('public/data/categories.json');
if (!isRecord(categoryData) || !Array.isArray(categoryData.categories)) fail('categories.json 格式無效。');
const categoryCodes = new Set();
for (const category of categoryData.categories) {
  if (!isRecord(category) || !/^[a-z]$/.test(category.code) || !nonEmptyString(category.name) || !Array.isArray(category.aliases)) fail('categories.json 存在無效類型。');
  if (categoryCodes.has(category.code)) fail(`類型 code 重複：${category.code}`);
  categoryCodes.add(category.code);
}

const index = await readDataJson('works.json');
if (!isRecord(index) || index.schemaVersion !== 2 || !Array.isArray(index.works)) fail('新 works.json 格式無效。');

const allIds = new Set();
const indexedItemPaths = new Set();
let itemCount = 0;
let physicalQuantity = 0;
let imageCount = 0;

for (const work of index.works) {
  if (!isRecord(work) || !nonEmptyString(work.id) || !nonEmptyString(work.name) || !nonEmptyString(work.code) || work.path !== `data/${work.id}`) fail(`作品索引格式無效：${work?.id ?? '<unknown>'}`);
  const workRoot = path.join(dataRoot, work.id);
  let workEntries;
  try { workEntries = await fs.readdir(workRoot, { withFileTypes: true }); } catch { fail(`找不到作品目錄：${work.id}`); }
  const registeredCategoryDirs = new Set(workEntries.filter(entry => entry.isDirectory()).map(entry => entry.name));
  for (const category of registeredCategoryDirs) {
    if (!categoryCodes.has(category)) fail(`未註冊的類型目錄：${work.id}/${category}`);
    const categoryPath = `data/${work.id}/${category}/index.json`;
    const categoryIndex = await readDataJson(`${work.id}/${category}/index.json`);
    if (!isRecord(categoryIndex) || categoryIndex.schemaVersion !== 1 || categoryIndex.workId !== work.id || categoryIndex.category !== category || !Array.isArray(categoryIndex.items)) fail(`Category index 無效：${work.id}/${category}`);
    const indexedIds = new Set();
    const actualEntries = (await fs.readdir(path.join(workRoot, category), { withFileTypes: true })).filter(entry => entry.isDirectory());
    const actualItemIds = new Set(actualEntries.map(entry => entry.name));
    for (const entry of categoryIndex.items) {
      if (!isRecord(entry) || !nonEmptyString(entry.id) || indexedIds.has(entry.id)) fail(`Category index Item 無效或重複：${work.id}/${category}`);
      indexedIds.add(entry.id);
      if (allIds.has(entry.id)) fail(`發現重複 Item ID：${entry.id}`);
      allIds.add(entry.id);
      const idMatch = ITEM_ID_RE.exec(entry.id);
      if (!idMatch || idMatch[2] !== category) fail(`Item ID 與 category 不一致：${entry.id}`);
      if (entry.path !== `data/${work.id}/${category}/${entry.id}/data.json`) fail(`Item path 不一致：${entry.id}`);
      indexedItemPaths.add(entry.path);
      if (!actualItemIds.has(entry.id)) fail(`Category index 指向不存在的 Item 目錄：${entry.id}`);
      const itemDir = path.join(workRoot, category, entry.id);
      const item = await readDataJson(`${work.id}/${category}/${entry.id}/data.json`);
      if (!isRecord(item)) fail(`Item data 無效：${entry.id}`);
      for (const key of ['id','workId','title','series','characters','category','manufacturer','quantity','status','description','notes','purchase','arrival','afterSales','images']) if (!(key in item)) fail(`Item 缺少欄位：${entry.id}.${key}`);
      if (item.id !== entry.id || item.workId !== work.id || item.category !== category) fail(`Item identity 不一致：${entry.id}`);
      if (!nonEmptyString(item.title) || !Array.isArray(item.series) || item.series.some(value => typeof value !== 'string') || !Array.isArray(item.characters) || item.characters.some(value => typeof value !== 'string') || !nonEmptyString(item.category) || typeof item.manufacturer !== 'string') fail(`Item 基本資料無效：${entry.id}`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) fail(`Item quantity 無效：${entry.id}`);
      if (!isRecord(item.purchase) || !isRecord(item.arrival) || !isRecord(item.afterSales) || !Array.isArray(item.images)) fail(`Item 子結構無效：${entry.id}`);
      if (['shipping','material','release','workName','createdAt','updatedAt'].some(key => key in item)) fail(`Item 含有已淘汰欄位：${entry.id}`);

      const summary = { id: item.id, path: entry.path, title: item.title, characters: item.characters, manufacturer: item.manufacturer, quantity: item.quantity, status: item.status };
      if (canonicalJson(summary) !== canonicalJson({ id: entry.id, path: entry.path, title: entry.title, characters: entry.characters, manufacturer: entry.manufacturer, quantity: entry.quantity, status: entry.status })) fail(`Category index metadata 與 Item 不一致：${entry.id}`);

      const imageDir = path.join(itemDir, 'images');
      let imageFiles = [];
      try { imageFiles = (await fs.readdir(imageDir, { withFileTypes: true })).filter(file => file.isFile()).map(file => file.name); } catch { if (item.images.length) fail(`Item 缺少 images 目錄：${entry.id}`); }
      const metadataFiles = new Set();
      const metadataIds = new Set();
      let covers = 0;
      let coverFile = '';
      for (const image of item.images) {
        if (!isRecord(image) || !nonEmptyString(image.id) || !nonEmptyString(image.file) || image.file !== path.basename(image.file) || !IMAGE_RE.test(image.file)) fail(`圖片 metadata 無效：${entry.id}`);
        if (metadataIds.has(image.id)) fail(`圖片 metadata ID 重複：${entry.id}/${image.id}`);
        if (metadataFiles.has(image.file)) fail(`圖片檔案重複：${entry.id}/${image.file}`);
        metadataIds.add(image.id); metadataFiles.add(image.file);
        if (!imageFiles.includes(image.file)) fail(`找不到 Item 圖片檔案：${entry.id}/${image.file}`);
        if (image.isCover === true) { covers += 1; coverFile = image.file; }
        if (image.sha256 !== undefined && (!/^[a-f0-9]{64}$/i.test(String(image.sha256)))) fail(`圖片 SHA-256 metadata 無效：${entry.id}/${image.file}`);
        if (image.sha256) { const actualSha = await sha256(path.join(imageDir, image.file)); if (actualSha.toLowerCase() !== String(image.sha256).toLowerCase()) fail(`圖片 SHA-256 不一致：${entry.id}/${image.file}`); }
        imageCount += 1;
      }
      if (covers > 1) fail(`一個 Item 有多個封面：${entry.id}`);
      if (imageFiles.some(file => !IMAGE_RE.test(file))) fail(`Item images 含有不允許的檔案：${entry.id}`);
      if (imageFiles.some(file => !metadataFiles.has(file))) fail(`發現孤立圖片：${entry.id}`);
      if (entry.cover !== undefined && (!nonEmptyString(entry.cover) || entry.cover !== coverFile)) fail(`Category index 封面與 Item metadata 不一致：${entry.id}`);
      if (coverFile && entry.cover === undefined) fail(`Category index 缺少封面：${entry.id}`);
      itemCount += 1;
      physicalQuantity += item.quantity;
    }
    for (const actualId of actualItemIds) if (!indexedIds.has(actualId)) fail(`發現未註冊於 Category index 的 Item 目錄：${work.id}/${category}/${actualId}`);
  }
}

console.log(`New data verification passed: ${index.works.length} works, ${itemCount} item records, ${physicalQuantity} physical items, ${imageCount} images.`);
