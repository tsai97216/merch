import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const validationPath = path.join(root, 'worker/src/validation.ts');
const workerPath = path.join(root, 'worker/src/index.ts');
const source = fs.readFileSync(validationPath, 'utf8');
const workerSource = fs.readFileSync(workerPath, 'utf8');
const requiredExports = ['isRecord', 'isStringArray', 'isValidImage', 'isValidItem', 'isValidShipping'];
for (const name of requiredExports) {
  if (!new RegExp(`export\\s+function\\s+${name}\\b`).test(source)) throw new Error(`Worker validation 缺少 export：${name}`);
}
if (!/import\s*\{[^}]*isValidImage[^}]*isValidItem[^}]*isValidShipping[^}]*\}\s*from\s*['"]\.\/validation['"]/.test(workerSource)) throw new Error('Worker index 未接入 canonical validation module。');
if (/function\s+validateShipping\([^)]*\)\s*\{[^}]*typeof\s+v\.amount\s*!==\s*['"]number['"][^}]*Array\.isArray\(v\.itemIds\)/s.test(workerSource)) throw new Error('Worker index 仍保留重複 Shipping 結構驗證。');
if (/function\s+validateItem\([^)]*\)\s*\{[^}]*Array\.isArray\(v\.series\)[^}]*Array\.isArray\(v\.characters\)/s.test(workerSource)) throw new Error('Worker index 仍保留重複 Item 結構驗證。');
if (/function\s+normalizeImages\([^)]*\)\s*\{[^}]*!image\.file[^}]*!image\.id/s.test(workerSource)) throw new Error('Worker index 仍保留重複 Image 結構驗證。');
if (!/ITEM_ID_RE/.test(workerSource) || !/CATEGORY_RE/.test(workerSource) || !/remote\.items\.has\(id\)/.test(workerSource)) throw new Error('Worker-specific remote context validation 遺失。');

const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
    strict: true
  }
}).outputText;

const tempPath = path.join(root, '.worker-validation-contract.cjs');
fs.writeFileSync(tempPath, output, 'utf8');
try {
  const validation = await import(`file://${tempPath}?t=${Date.now()}`);
  const validImage = { id: 'img-1', file: 'cover.png' };
  if (!validation.isValidImage(validImage)) throw new Error('valid image 被拒絕');
  if (validation.isValidImage({ ...validImage, id: '' })) throw new Error('空 image id 未被拒絕');

  const validItem = {
    id: 'ZZa001', workId: 'zzz', title: 'Test', series: [], characters: [], category: 'a', manufacturer: '',
    quantity: 1, status: 'received', description: '', notes: '', purchase: {}, arrival: {}, afterSales: {}, images: [validImage]
  };
  if (!validation.isValidItem(validItem)) throw new Error('valid item 被拒絕');
  if (validation.isValidItem({ ...validItem, quantity: 0 })) throw new Error('invalid quantity 未被拒絕');
  if (validation.isValidItem({ ...validItem, images: [validImage, validImage] })) throw new Error('duplicate image id 未被拒絕');

  const validShipping = { id: 'ship-1', amount: 0, currency: 'TWD', itemIds: ['ZZa001'] };
  if (!validation.isValidShipping(validShipping)) throw new Error('valid shipping 被拒絕');
  if (validation.isValidShipping({ ...validShipping, amount: -1 })) throw new Error('negative shipping amount 未被拒絕');
  if (validation.isValidShipping({ ...validShipping, itemIds: [] })) throw new Error('empty shipping itemIds 未被拒絕');
} finally {
  fs.rmSync(tempPath, { force: true });
}

console.log('Worker validation module contract passed.');
