#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Migrate the legacy `public/data/works/*.json` structure into:
 * data/<work>/<category>/index.json
 * data/<work>/<category>/<item-id>/data.json
 * data/<work>/<category>/<item-id>/images/*
 *
 * The migration is deliberately non-destructive: it writes a new output root
 * and never removes or modifies the legacy source files.
 */

const [, , sourceArg = 'public/data', outputArg = 'data-migrated'] = process.argv;
const root = process.cwd();
const sourceRoot = path.resolve(root, sourceArg);
const outputRoot = path.resolve(root, outputArg);

const CATEGORY_BY_CODE = new Map([
  ['b', '徽章／吧唧'], ['c', '卡片'], ['d', '立牌／擺件'], ['e', '電子產品'],
  ['f', '手辦／模型'], ['g', '文具'], ['h', '海報／掛畫／掛軸'], ['k', '掛件／吊飾'],
  ['l', '文件／資料夾'], ['m', '書籍／漫畫'], ['n', '明信片'], ['o', '其他'],
  ['p', '毛絨／布偶'], ['q', '鑰匙圈'], ['r', '雷射票'], ['s', '色紙'],
  ['v', '服飾'], ['w', '餐具／生活用品'], ['y', '特典'],
]);

const CATEGORY_ALIASES = new Map([
  ['徽章', 'b'], ['吧唧', 'b'],
  ['卡片', 'c'], ['小卡', 'c'], ['閃卡', 'c'], ['訂金卡', 'c'], ['特典卡', 'c'],
  ['立牌', 'd'], ['擺件', 'd'],
  ['電子產品', 'e'], ['電子周邊', 'e'],
  ['手辦', 'f'], ['PVC', 'f'], ['GK', 'f'], ['模型', 'f'], ['可動人偶', 'f'],
  ['文具', 'g'], ['筆', 'g'], ['筆記本', 'g'], ['便條紙', 'g'],
  ['海報', 'h'], ['掛畫', 'h'], ['掛軸', 'h'], ['布掛', 'h'],
  ['掛件', 'k'], ['吊飾', 'k'], ['亞克力吊飾', 'k'],
  ['文件夾', 'l'], ['資料夾', 'l'], ['L夾', 'l'],
  ['書籍', 'm'], ['漫畫', 'm'], ['畫冊', 'm'], ['畫集', 'm'], ['設定集', 'm'], ['小說', 'm'], ['公式書', 'm'],
  ['明信片', 'n'], ['明信卡', 'n'],
  ['其他', 'o'],
  ['毛絨', 'p'], ['布偶', 'p'], ['娃娃', 'p'], ['玩偶', 'p'], ['趴趴', 'p'],
  ['鑰匙圈', 'q'], ['鑰匙扣', 'q'], ['Keychain', 'q'],
  ['雷射票', 'r'], ['紀念票', 'r'],
  ['色紙', 's'], ['簽名色紙', 's'], ['迷你色紙', 's'],
  ['服飾', 'v'], ['T恤', 'v'], ['T-shirt', 'v'], ['外套', 'v'], ['帽子', 'v'], ['襪子', 'v'],
  ['餐具', 'w'], ['生活用品', 'w'], ['杯子', 'w'], ['碗', 'w'], ['毛巾', 'w'], ['傘', 'w'],
  ['特典', 'y'], ['購買特典', 'y'], ['活動特典', 'y'], ['店舖特典', 'y'],
]);

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmptyString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 必須是非空字串`);
  return value.trim();
};

const safeSegment = (value, label) => {
  const segment = nonEmptyString(value, label);
  if (segment === '.' || segment === '..' || /[\\/]/.test(segment)) throw new Error(`${label} 含有非法路徑字元`);
  return segment;
};

function normalizeQuantity(value, label) {
  if (value === undefined) return 1;
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label}.quantity 必須是大於等於 1 的整數`);
  return value;
}

function normalizeSeries(value) {
  if (Array.isArray(value)) return value.filter((entry) => typeof entry === 'string' && entry.trim()).map((entry) => entry.trim());
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === 'string' && entry.trim()).map((entry) => entry.trim()) : [];
}

function categoryCode(rawCategory, itemId) {
  const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
  if (!category) {
    const match = /^([A-Z]{2,3})([a-z])\d{3}$/.exec(itemId);
    const code = match?.[2];
    if (code && CATEGORY_BY_CODE.has(code)) return code;
    throw new Error(`${itemId}.category 缺失，且無法由 Item ID 判斷類型`);
  }
  if (/^[a-z]$/.test(category) && CATEGORY_BY_CODE.has(category)) return category;
  const direct = CATEGORY_ALIASES.get(category);
  if (direct) return direct;
  for (const [alias, code] of CATEGORY_ALIASES) {
    if (category.includes(alias)) return code;
  }
  throw new Error(`${itemId}.category 無法映射至新類型：${category}`);
}

function normalizeImage(rawImage, index, itemId) {
  if (!isRecord(rawImage)) throw new Error(`${itemId}.images[${index}] 必須是物件`);
  const sourcePath = typeof rawImage.path === 'string' ? rawImage.path : '';
  const fileFromPath = sourcePath ? path.basename(sourcePath) : '';
  const file = nonEmptyString(rawImage.file ?? fileFromPath, `${itemId}.images[${index}].file`);
  if (file !== path.basename(file) || file === '.' || file === '..') throw new Error(`${itemId}.images[${index}].file 含有非法路徑`);
  const id = nonEmptyString(rawImage.id ?? path.parse(file).name, `${itemId}.images[${index}].id`);
  return {
    id,
    file,
    ...(typeof rawImage.alt === 'string' ? { alt: rawImage.alt } : {}),
    ...(rawImage.isCover === true ? { isCover: true } : {}),
    sourcePath,
  };
}

function normalizeItem(raw, work) {
  if (!isRecord(raw)) throw new Error(`作品 ${work.id} 的收藏品必須是物件`);
  const id = safeSegment(raw.id, 'item.id');
  const title = nonEmptyString(raw.title ?? raw.name, `${id}.title`);
  const category = categoryCode(raw.category, id);
  const rawPurchase = isRecord(raw.purchase) ? raw.purchase : {};
  const rawRelease = isRecord(raw.release) ? raw.release : {};
  const rawAfterSales = isRecord(raw.afterSales) ? raw.afterSales : {};
  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages.map((image, index) => normalizeImage(image, index, id));
  const imageIds = new Set();
  for (const image of images) {
    if (imageIds.has(image.id)) throw new Error(`${id} 存在重複圖片 ID：${image.id}`);
    imageIds.add(image.id);
  }
  const covers = images.filter((image) => image.isCover === true);
  if (covers.length > 1) throw new Error(`${id} 存在多個封面圖片`);

  const item = {
    id,
    workId: work.id,
    title,
    series: normalizeSeries(raw.series),
    characters: normalizeStringArray(raw.characters),
    category,
    manufacturer: typeof raw.manufacturer === 'string' ? raw.manufacturer.trim() : '',
    quantity: normalizeQuantity(raw.quantity, id),
    status: nonEmptyString(raw.status ?? 'pending', `${id}.status`),
    description: typeof raw.description === 'string' ? raw.description : '',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    purchase: {
      ...(typeof rawPurchase.price === 'number' && Number.isFinite(rawPurchase.price) ? { price: rawPurchase.price } : {}),
      ...(typeof rawPurchase.currency === 'string' ? { currency: rawPurchase.currency } : {}),
      ...(typeof rawPurchase.platform === 'string' ? { platform: rawPurchase.platform } : {}),
      ...(typeof rawPurchase.date === 'string' ? { date: rawPurchase.date } : {}),
    },
    arrival: {
      ...(typeof rawRelease.expectedDate === 'string' ? { expectedDate: rawRelease.expectedDate || null } : {}),
      ...(typeof rawRelease.receivedDate === 'string' ? { receivedDate: rawRelease.receivedDate || null } : {}),
    },
    afterSales: {
      ...(typeof rawAfterSales.status === 'string' ? { status: rawAfterSales.status } : {}),
      ...(typeof rawAfterSales.note === 'string' ? { note: rawAfterSales.note } : {}),
    },
    images: images.map(({ sourcePath, ...image }) => image),
  };

  return { item, images };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function findSourceImage(sourcePath, workId, itemId, file) {
  const candidates = [];
  if (sourcePath) candidates.push(path.resolve(root, sourcePath));
  candidates.push(path.resolve(root, 'data', workId, 'images', itemId, file));
  candidates.push(path.resolve(root, 'data', workId, 'images', itemId, path.basename(file)));
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {}
  }
  return null;
}

const worksIndex = await readJson(path.join(sourceRoot, 'works.json'));
if (!isRecord(worksIndex) || !Array.isArray(worksIndex.works)) throw new Error('works.json 格式無效');

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });

const newWorks = [];
const allIds = new Set();
let imageCount = 0;

for (const entry of worksIndex.works) {
  const workId = safeSegment(entry.id, 'work.id');
  const workName = nonEmptyString(entry.name, `${workId}.name`);
  const workCode = nonEmptyString(entry.code, `${workId}.code`);
  const legacyPath = String(entry.data).replace(/^\//, '');
  const legacyFile = legacyPath.startsWith('data/') ? path.join(root, 'public', legacyPath) : path.resolve(root, legacyPath);
  const payload = await readJson(legacyFile);
  if (!isRecord(payload) || !Array.isArray(payload.items)) throw new Error(`作品資料格式無效：${workId}`);

  const categoryItems = new Map();
  for (const rawItem of payload.items) {
    const { item, images } = normalizeItem(rawItem, { id: workId, name: workName });
    if (allIds.has(item.id)) throw new Error(`跨作品存在重複 Item ID：${item.id}`);
    allIds.add(item.id);

    const categoryDir = path.join(outputRoot, workId, item.category);
    const itemDir = path.join(categoryDir, item.id);
    await fs.mkdir(path.join(itemDir, 'images'), { recursive: true });
    await fs.writeFile(path.join(itemDir, 'data.json'), JSON.stringify(item, null, 2) + '\n');

    for (const image of images) {
      const sourceImage = await findSourceImage(image.sourcePath, workId, item.id, image.file);
      if (!sourceImage) throw new Error(`找不到圖片：${item.id}/${image.file}`);
      await fs.copyFile(sourceImage, path.join(itemDir, 'images', image.file));
      imageCount += 1;
    }

    if (!categoryItems.has(item.category)) categoryItems.set(item.category, []);
    categoryItems.get(item.category).push({
      id: item.id,
      path: `data/${workId}/${item.category}/${item.id}/data.json`,
      title: item.title,
      characters: item.characters,
      manufacturer: item.manufacturer,
      quantity: item.quantity,
      status: item.status,
      ...(item.images.find((image) => image.isCover === true)?.file ? { cover: item.images.find((image) => image.isCover === true).file } : {}),
    });
  }

  for (const [category, items] of categoryItems) {
    await fs.writeFile(
      path.join(outputRoot, workId, category, 'index.json'),
      JSON.stringify({ schemaVersion: 1, workId, category, items }, null, 2) + '\n',
    );
  }

  newWorks.push({ id: workId, name: workName, code: workCode, path: `data/${workId}` });
}

await fs.writeFile(
  path.join(outputRoot, 'works.json'),
  JSON.stringify({ schemaVersion: 2, works: newWorks }, null, 2) + '\n',
);

console.log(`Migration 完成：${newWorks.length} 個作品、${allIds.size} 個收藏品、${imageCount} 張圖片`);
console.log(`輸出：${outputRoot}`);
console.log('注意：這是非破壞性 migration，舊資料未刪除。完成 Verify 後才應切換正式資料來源。');
