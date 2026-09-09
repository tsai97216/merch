import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/management.ts', import.meta.url), 'utf8');
const labels = fs.readFileSync(new URL('../src/category-label.ts', import.meta.url), 'utf8');
const required = ['management-series','management-characters','management-picker-category','management-manufacturer','management-quantity','management-status','management-price','management-currency','management-platform','management-purchase-date','management-expected-date','management-received-date','management-after-sales-status','management-after-sales-note'];
for (const field of required) if (!source.includes(field)) throw new Error(`Management 缺少新版欄位：${field}`);
for (const forbidden of ['item.release','item.shipping','item.material','base.release','base.shipping','base.material','createCategoryCode','blankItem','cleanupOrphanAssets','management-cleanup-assets']) if (source.includes(forbidden)) throw new Error(`Management 不得直接使用舊欄位或已移除功能：${forbidden}`);
if (!source.includes("window.location.hash = '#/add'")) throw new Error('Management 的新增按鈕必須直接導向新增頁。');
if (!source.includes("title.textContent = '編輯收藏'")) throw new Error('Management 必須維持編輯模式。');
if (!labels.includes('function categoryName')) throw new Error('Category label source 缺少 categoryName 單一來源。');
console.log('Management schema contract: OK');
