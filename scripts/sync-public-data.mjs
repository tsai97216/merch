#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'data');
const publicRoot = path.join(root, 'public', 'data');
const sourceIndex = path.join(sourceRoot, 'works.json');

try {
  await fs.access(sourceIndex);
} catch {
  console.log('Hierarchical data root not present yet; keeping legacy public data for compatibility.');
  process.exit(0);
}

await fs.rm(path.join(publicRoot, 'works'), { recursive: true, force: true });
for (const entry of await fs.readdir(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  await fs.rm(path.join(publicRoot, entry.name), { recursive: true, force: true });
  await fs.cp(path.join(sourceRoot, entry.name), path.join(publicRoot, entry.name), { recursive: true });
}
await fs.copyFile(sourceIndex, path.join(publicRoot, 'works.json'));
console.log('Public data synchronized from hierarchical data root.');
