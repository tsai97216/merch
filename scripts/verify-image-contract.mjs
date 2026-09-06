import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'data');
const WORKS_PATH = path.join(DATA_ROOT, 'works.json');
const CATEGORY_RE = /^[a-z]$/;
const IMAGE_RE = /^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function fail(message) {
  throw new Error(`[image-contract] ${message}`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

if (!fs.existsSync(WORKS_PATH)) fail('data/works.json 不存在。');
const worksIndex = readJson(WORKS_PATH);
if (worksIndex.schemaVersion !== 2 || !Array.isArray(worksIndex.works)) fail('works.json 必須是 schemaVersion 2。');

let itemCount = 0;
let imageCount = 0;
const referenced = new Set();

for (const work of worksIndex.works) {
  const workRoot = path.join(DATA_ROOT, work.id);
  if (!fs.existsSync(workRoot)) continue;
  for (const category of fs.readdirSync(workRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    if (!CATEGORY_RE.test(category.name)) fail(`無效分類目錄：${work.id}/${category.name}`);
    const categoryRoot = path.join(workRoot, category.name);
    const indexPath = path.join(categoryRoot, 'index.json');
    if (!fs.existsSync(indexPath)) fail(`缺少分類索引：${path.relative(ROOT, indexPath)}`);
    const categoryIndex = readJson(indexPath);
    for (const entry of categoryIndex.items || []) {
      itemCount += 1;
      const itemPath = path.join(ROOT, entry.path);
      if (!fs.existsSync(itemPath)) fail(`index 指向不存在的 Item：${entry.id}`);
      const item = readJson(itemPath);
      if (!Array.isArray(item.images)) fail(`Item ${item.id} 的 images 必須是陣列。`);
      const ids = new Set();
      const files = new Set();
      let coverCount = 0;
      for (const image of item.images) {
        imageCount += 1;
        if (!image || typeof image !== 'object') fail(`Item ${item.id} 存在無效圖片 metadata。`);
        if (typeof image.id !== 'string' || !image.id) fail(`Item ${item.id} 有圖片缺少 id。`);
        if (ids.has(image.id)) fail(`Item ${item.id} 有重複圖片 id：${image.id}`);
        ids.add(image.id);
        if (typeof image.file !== 'string' || !IMAGE_RE.test(image.file)) fail(`Item ${item.id} 有無效圖片檔名：${String(image.file)}`);
        if (files.has(image.file)) fail(`Item ${item.id} 有重複圖片檔案：${image.file}`);
        files.add(image.file);
        if (image.isCover === true) coverCount += 1;
        const imagePath = path.join(path.dirname(itemPath), 'images', image.file);
        const relativeImagePath = path.relative(ROOT, imagePath).replaceAll('\\', '/');
        if (referenced.has(relativeImagePath)) fail(`圖片被多個 Item metadata 引用：${relativeImagePath}`);
        referenced.add(relativeImagePath);
        if (!fs.existsSync(imagePath)) fail(`Item ${item.id} 缺少圖片實體：${relativeImagePath}`);
        if (image.sha && image.sha !== sha256(imagePath)) fail(`Item ${item.id} 圖片 SHA-256 不一致：${image.file}`);
      }
      if (coverCount > 1) fail(`Item ${item.id} 只能有一張 cover。`);
      const imageRoot = path.join(path.dirname(itemPath), 'images');
      if (fs.existsSync(imageRoot)) {
        for (const file of fs.readdirSync(imageRoot, { withFileTypes: true })) {
          if (!file.isFile()) continue;
          const relativeImagePath = path.relative(ROOT, path.join(imageRoot, file.name)).replaceAll('\\', '/');
          if (!referenced.has(relativeImagePath)) fail(`存在未被 Item metadata 引用的圖片：${relativeImagePath}`);
        }
      }
      const cover = item.images.find((image) => image.isCover === true);
      const indexedCover = entry.cover;
      if ((cover?.file || undefined) !== (indexedCover || undefined)) fail(`Item ${item.id} 的 index cover 與 data.json 不一致。`);
    }
  }
}

console.log(`Image contract OK: ${itemCount} Items, ${imageCount} images.`);
