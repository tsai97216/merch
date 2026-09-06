#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data');

try {
  await fs.access(path.join(dataRoot, 'works.json'));
} catch {
  throw new Error('新資料架構不存在：請先完成 migration，再執行 npm run verify。');
}

await import(`./verify-new-data.mjs?verify=${Date.now()}`);
