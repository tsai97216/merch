#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceFiles = ['src/main.ts', 'src/management.ts', 'src/store.ts', 'src/api.ts', 'src/image-source.ts'];
const forbidden = [
  ['item.release', 'runtime 已不應依賴 release 欄位'],
  ['item.shipping', 'runtime 已不應依賴 shipping 欄位'],
  ['item.material', '材質不是 canonical Item 欄位'],
];
const fail = message => { throw new Error(message); };

for (const relative of sourceFiles) {
  const file = path.join(root, relative);
  let text;
  try { text = await fs.readFile(file, 'utf8'); }
  catch { continue; }
  for (const [needle, message] of forbidden) {
    if (text.includes(needle)) fail(`${relative}: ${message} (${needle})`);
  }
}

console.log('Runtime schema compatibility scan passed.');
