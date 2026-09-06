#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const sourceRoot = path.resolve(root, process.argv[2] || 'public/data');
const newRoot = path.resolve(root, process.argv[3] || 'data-migrated');
const fail = (message) => { throw new Error(message); };
const isRecord = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const sha256 = async (file) => crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
const categoryAliases = new Map([
  ['徽章','b'],['吧唧','b'],['卡片','c'],['小卡','c'],['閃卡','c'],['訂金卡','c'],['特典卡','c'],['立牌','d'],['擺件','d'],['電子產品','e'],['電子周邊','e'],['手辦','f'],['PVC','f'],['GK','f'],['模型','f'],['可動人偶','f'],['文具','g'],['筆','g'],['筆記本','g'],['便條紙','g'],['海報','h'],['掛畫','h'],['掛軸','h'],['布掛','h'],['掛件','k'],['吊飾','k'],['亞克力吊飾','k'],['文件夾','l'],['資料夾','l'],['L夾','l'],['書籍','m'],['漫畫','m'],['畫冊','m'],['畫集','m'],['設定集','m'],['小說','m'],['公式書','m'],['明信片','n'],['明信卡','n'],['其他','o'],['毛絨','p'],['布偶','p'],['娃娃','p'],['玩偶','p'],['趴趴','p'],['鑰匙圈','q'],['鑰匙扣','q'],['Keychain','q'],['雷射票','r'],['紀念票','r'],['色紙','s'],['簽名色紙','s'],['迷你色紙','s'],['服飾','v'],['T恤','v'],['T-shirt','v'],['外套','v'],['帽子','v'],['襪子','v'],['餐具','w'],['生活用品','w'],['杯子','w'],['碗','w'],['毛巾','w'],['傘','w'],['特典','y'],['購買特典','y'],['活動特典','y'],['店舖特典','y']
]);
function category(raw, id) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (/^[a-z]$/.test(value)) return value;
  const direct = categoryAliases.get(value); if (direct) return direct;
  for (const [alias, code] of categoryAliases) if (value.includes(alias)) return code;
  const match = /^([A-Z]{2,3})([a-z])\d{3}$/.exec(id); if (match) return match[2];
  fail(`${id}.category 無法比對`);
}
function arr(v, scalar = false) {
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim());
  if (scalar && typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}
function normalizeLegacy(raw, workId) {
  const id = String(raw.id);
  const purchase = isRecord(raw.purchase) ? raw.purchase : {};
  const release = isRecord(raw.release) ? raw.release : {};
  const afterSales = isRecord(raw.afterSales) ? raw.afterSales : {};
  const images = Array.isArray(raw.images) ? raw.images.map((image) => {
    const source = isRecord(image) ? image : {};
    const sourcePath = typeof source.path === 'string' ? source.path : '';
    const file = String(source.file ?? (sourcePath ? path.basename(sourcePath) : ''));
    return { id: String(source.id ?? path.parse(file).name), file, ...(typeof source.alt === 'string' ? { alt: source.alt } : {}), ...(source.isCover === true ? { isCover: true } : {}) };
  }) : [];
  return {
    id,
    workId,
    title: String(raw.title ?? raw.name ?? '').trim(),
    series: arr(raw.series, true),
    characters: arr(raw.characters),
    category: category(raw.category, id),
    manufacturer: typeof raw.manufacturer === 'string' ? raw.manufacturer.trim() : '',
    quantity: Number.isInteger(raw.quantity) && raw.quantity >= 1 ? raw.quantity : 1,
    status: String(raw.status ?? 'pending').trim(),
    description: typeof raw.description === 'string' ? raw.description : '',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    purchase: { ...(typeof purchase.price === 'number' && Number.isFinite(purchase.price) ? { price: purchase.price } : {}), ...(typeof purchase.currency === 'string' ? { currency: purchase.currency } : {}), ...(typeof purchase.platform === 'string' ? { platform: purchase.platform } : {}), ...(typeof purchase.date === 'string' ? { date: purchase.date } : {}) },
    arrival: { ...(typeof release.expectedDate === 'string' ? { expectedDate: release.expectedDate || null } : {}), ...(typeof release.receivedDate === 'string' ? { receivedDate: release.receivedDate || null } : {}) },
    afterSales: { ...(typeof afterSales.status === 'string' ? { status: afterSales.status } : {}), ...(typeof afterSales.note === 'string' ? { note: afterSales.note } : {}) },
    images,
  };
}
const legacyIndex = await readJson(path.join(sourceRoot, 'works.json'));
const newIndex = await readJson(path.join(newRoot, 'works.json'));
if (!Array.isArray(legacyIndex.works) || newIndex.schemaVersion !== 2) fail('migration 比對索引格式無效');
const legacyItems = new Map();
const legacyImages = new Map();
for (const work of legacyIndex.works) {
  const relative = String(work.data).replace(/^\//, '');
  const payload = await readJson(relative.startsWith('data/') ? path.join(root, 'public', relative) : path.resolve(root, relative));
  if (!Array.isArray(payload.items)) fail(`legacy items 無效：${work.id}`);
  for (const raw of payload.items) {
    const normalized = normalizeLegacy(raw, work.id);
    if (legacyItems.has(normalized.id)) fail(`legacy 重複 Item ID：${normalized.id}`);
    legacyItems.set(normalized.id, normalized);
    legacyImages.set(normalized.id, normalized.images);
  }
}
const newItems = new Map();
for (const work of newIndex.works) {
  const workRoot = path.join(newRoot, work.id);
  for (const categoryDir of await fs.readdir(workRoot, { withFileTypes: true })) {
    if (!categoryDir.isDirectory()) continue;
    const category = categoryDir.name;
    const index = await readJson(path.join(workRoot, category, 'index.json'));
    for (const entry of index.items) {
      const item = await readJson(path.join(root, entry.path));
      if (newItems.has(item.id)) fail(`new 重複 Item ID：${item.id}`);
      newItems.set(item.id, item);
    }
  }
}
const legacyIds = [...legacyItems.keys()].sort();
const newIds = [...newItems.keys()].sort();
if (JSON.stringify(legacyIds) !== JSON.stringify(newIds)) fail(`Item ID 集合不一致：legacy=${legacyIds.join(',')} new=${newIds.join(',')}`);
let quantityLegacy = 0;
let quantityNew = 0;
let imageMetaCount = 0;
for (const id of legacyIds) {
  const before = legacyItems.get(id);
  const after = newItems.get(id);
  if (JSON.stringify(before) !== JSON.stringify(after)) fail(`Item migration 內容不一致：${id}`);
  quantityLegacy += before.quantity;
  quantityNew += after.quantity;
  const beforeImages = legacyImages.get(id) || [];
  const afterImages = after.images || [];
  if (JSON.stringify(beforeImages) !== JSON.stringify(afterImages)) fail(`圖片 metadata 集合不一致：${id}`);
  imageMetaCount += afterImages.length;
  for (const image of afterImages) {
    const source = typeof (Array.isArray((await readJson(path.join(root, 'public', String(legacyIndex.works.find(w => w.id === before.workId)?.data).replace(/^\//, ''))).catch(() => null))?.items) === 'undefined' ? null : null;
    const newFile = path.join(newRoot, before.workId, before.category, id, 'images', image.file);
    if (!(await fs.stat(newFile).catch(() => null))) fail(`新資料缺少圖片：${id}/${image.file}`);
    if (image.sha256) { const actual = await sha256(newFile); if (actual.toLowerCase() !== String(image.sha256).toLowerCase()) fail(`新圖片 SHA-256 不一致：${id}/${image.file}`); }
  }
}
if (quantityLegacy !== quantityNew) fail(`quantity 總和不一致：legacy=${quantityLegacy} new=${quantityNew}`);
console.log(`Migration equivalence passed: ${newIndex.works.length} works, ${newItems.size} items, quantity ${quantityNew}, ${imageMetaCount} image records.`);
