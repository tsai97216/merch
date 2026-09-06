import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/management.ts', import.meta.url), 'utf8');
const required = ['management-series','management-characters','management-category','management-manufacturer','management-quantity','management-status','management-price','management-currency','management-platform','management-purchase-date','management-expected-date','management-received-date','management-after-sales-status','management-after-sales-note'];
for (const field of required) if (!source.includes(field)) throw new Error(`Management 缺少新版欄位：${field}`);
for (const forbidden of ['item.release','item.shipping','item.material','base.release','base.shipping','base.material']) if (source.includes(forbidden)) throw new Error(`Management 不得直接使用舊欄位：${forbidden}`);
if (!source.includes("createCategoryCode = 'o'")) throw new Error('Management 缺少預設安全分類。');
if (!source.includes("['o', '其他']")) throw new Error('Management 缺少「其他」分類。');
console.log('Management schema contract: OK');
