import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

if (process.env.IMAGE_RESET_CONFIRM !== 'RESET_ALL_IMAGES') {
  throw new Error('Refusing image reset: IMAGE_RESET_CONFIRM must be RESET_ALL_IMAGES.');
}

const ROOT = process.env.MERCH_DATA_ROOT || 'data';
const IMAGE_EXTENSIONS = /\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const VERSION = '1.109.411';

function walk(dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(path));
    else result.push(path);
  }
  return result;
}

let imageCount = 0;
let itemImageMetadataCount = 0;
let indexCoverCount = 0;

for (const path of walk(ROOT)) {
  const normalized = path.replaceAll('\\', '/');
  if (normalized.endsWith('/data.json')) {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    if (Array.isArray(value.images) && value.images.length) {
      itemImageMetadataCount += value.images.length;
      value.images = [];
      writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
    }
    continue;
  }
  if (normalized.endsWith('/index.json')) {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    if (Array.isArray(value.items)) {
      let changed = false;
      for (const item of value.items) {
        if (Object.prototype.hasOwnProperty.call(item, 'cover')) {
          delete item.cover;
          indexCoverCount += 1;
          changed = true;
        }
      }
      if (changed) writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
    }
  }
}

for (const path of walk(ROOT)) {
  const normalized = path.replaceAll('\\', '/');
  if (/^data\/[^/]+\/[a-z]\/[^/]+\/images\//i.test(normalized) && IMAGE_EXTENSIONS.test(normalized)) {
    unlinkSync(path);
    imageCount += 1;
  }
}

const packagePath = 'package.json';
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.version = VERSION;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const versionPath = 'public/data/version.json';
writeFileSync(versionPath, `${JSON.stringify({ version: VERSION }, null, 2)}\n`);

console.log(JSON.stringify({ imageCount, itemImageMetadataCount, indexCoverCount, version: VERSION }));
