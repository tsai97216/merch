import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'data';
const worksPath = path.join(root, 'works.json');
if (!fs.existsSync(worksPath)) throw new Error(`找不到 ${worksPath}`);

const works = JSON.parse(fs.readFileSync(worksPath, 'utf8'));
if (works.schemaVersion !== 2 || !Array.isArray(works.works)) throw new Error('works.json 不是 schemaVersion 2');

const forbidden = ['shipping', 'material', 'release', 'workName', 'createdAt', 'updatedAt'];
const itemIds = new Set();
let itemCount = 0;
let physicalQuantity = 0;
let imageCount = 0;

for (const work of works.works) {
  const workRoot = path.join(root, work.id);
  // Git cannot represent empty directories. A registered work may therefore
  // legitimately have no directory until its first Item is created.
  if (!fs.existsSync(workRoot)) continue;

  for (const category of fs.readdirSync(workRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const indexPath = path.join(workRoot, category.name, 'index.json');
    if (!fs.existsSync(indexPath)) throw new Error(`類型缺少 index.json：${indexPath}`);
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (index.schemaVersion !== 1 || index.workId !== work.id || index.category !== category.name || !Array.isArray(index.items)) {
      throw new Error(`類型索引格式錯誤：${indexPath}`);
    }
    for (const summary of index.items) {
      if (itemIds.has(summary.id)) throw new Error(`重複 Item ID：${summary.id}`);
      itemIds.add(summary.id);
      itemCount += 1;
      if (!summary.path || !summary.path.endsWith('/data.json')) throw new Error(`Item path 無效：${summary.id}`);
      const itemPath = path.join(root, summary.path.replace(/^data\//, ''));
      if (!fs.existsSync(itemPath)) throw new Error(`找不到 Item data.json：${summary.id}`);
      const item = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
      if (item.id !== summary.id || item.workId !== work.id || item.category !== category.name) throw new Error(`Item/index 不一致：${summary.id}`);
      for (const field of forbidden) if (Object.prototype.hasOwnProperty.call(item, field)) throw new Error(`Item 含禁止欄位 ${field}：${summary.id}`);
      if (!Array.isArray(item.images)) throw new Error(`images 必須是陣列：${summary.id}`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error(`Item quantity 無效：${summary.id}`);
      physicalQuantity += item.quantity;
      const imageDir = path.join(path.dirname(itemPath), 'images');
      const files = fs.existsSync(imageDir) ? fs.readdirSync(imageDir, { withFileTypes: true }).filter(entry => entry.isFile()) : [];
      imageCount += files.length;
      const metadataFiles = new Set(item.images.map(image => image.file));
      if (metadataFiles.size !== item.images.length || files.some(file => !metadataFiles.has(file.name)) || item.images.some(image => !files.some(file => file.name === image.file))) {
        throw new Error(`圖片 metadata / 實體檔案不一致：${summary.id}`);
      }
    }
  }
}

// A legacy work-level JSON must not survive directly under the new data root.
const legacyFiles = fs.readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.json') && !['works.json', 'categories.json', 'version.json'].includes(entry.name));
if (legacyFiles.length) throw new Error(`發現舊作品 JSON：${legacyFiles.map(entry => entry.name).join(', ')}`);

console.log(`Migration completion passed: ${works.works.length} works, ${itemCount} item records, ${physicalQuantity} physical items, ${imageCount} images.`);
