#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const workerPath = path.join(root, 'worker/src/index.ts');
const source = await fs.readFile(workerPath, 'utf8');

const required = [
  ['atomic commit helper', /function createAtomicCommit\(/],
  ['Git tree built from current base tree', /base_tree:\s*remote\.baseTreeSha/],
  ['commit parent bound to observed HEAD', /parents:\s*\[remote\.headSha\]/],
  ['non-force branch update', /force:\s*false/],
  ['stale write handling', /status === 422/],
  ['stale write user-facing error', /資料在寫入期間已被其他操作更新/],
  ['target Item lookup', /(?:remote\.items\.get\(id\)|category\.items\.some\(x => x\.id === id\))/],
  ['target Item path construction', /data\/\$\{work\.id\}\/\$\{(?:storageItem|item)\.category\}\/\$\{id\}\/data\.json/],
  ['category index update', /index\.json/],
  ['Item image directory path', /\/images\//],
  ['asset path whitelist', /ASSET_RE/],
  ['path traversal protection', /path\.includes\('\.\.'\)/],
  ['asset Item ownership check', /ITEM_PATH_MISMATCH/],
];

const missing = required.filter(([, pattern]) => !pattern.test(source));
if (missing.length) {
  throw new Error(`Worker architecture verification failed:\n${missing.map(([name]) => `- ${name}`).join('\n')}`);
}

if (/force:\s*true/.test(source)) throw new Error('Worker architecture verification failed: detected force=true branch update.');
if (/git\/refs\/heads.*PUT/.test(source)) throw new Error('Worker architecture verification failed: branch update must use the guarded PATCH flow.');

console.log(`Worker architecture verification passed: ${required.length} atomic/new-storage invariants.`);
