#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const publicDataRoot = path.join(root, 'public', 'data');
const outputPath = path.join(publicDataRoot, 'collection.json');

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function collectItemFiles(dir, result = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectItemFiles(entryPath, result);
    } else if (entry.isFile() && entry.name === 'data.json') {
      result.push(entryPath);
    }
  }
  return result;
}

const worksIndex = await readJson(path.join(dataRoot, 'works.json'));
if (!Array.isArray(worksIndex.works)) throw new Error('data/works.json works 必須是陣列。');

const versionData = await readJson(path.join(publicDataRoot, 'version.json'));
let shipping = [];
try {
  const shippingData = await readJson(path.join(publicDataRoot, 'shipping.json'));
  if (shippingData?.schemaVersion === 1 && Array.isArray(shippingData.records)) shipping = shippingData.records;
} catch {}

const works = [];
for (const work of worksIndex.works) {
  const itemFiles = await collectItemFiles(path.join(dataRoot, work.id));
  const items = [];
  for (const itemFile of itemFiles) {
    const item = await readJson(itemFile);
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Item 資料格式無效：${itemFile}`);
    items.push({ ...item, workId: work.id, workName: work.name });
  }
  items.sort((a, b) => a.id.localeCompare(b.id));
  works.push({ id: work.id, name: work.name, code: work.code, items });
}

const output = {
  schemaVersion: 1,
  version: versionData?.version,
  works,
  shipping,
};

await fs.writeFile(outputPath, `${JSON.stringify(output)}\n`, 'utf8');
console.log(`Static collection read model generated: ${works.reduce((sum, work) => sum + work.items.length, 0)} items.`);
