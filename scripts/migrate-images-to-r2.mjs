import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.env.MERCH_DATA_ROOT || 'data';
const BUCKET = process.env.R2_BUCKET || 'chi-merch-assets';
const WRANGLER = process.env.WRANGLER_BIN || 'npx';
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function walk(dir) {
  const result = [];
  if (!existsSync(dir)) return result;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(path));
    else if (EXTENSIONS.has(path.slice(path.lastIndexOf('.')).toLowerCase())) result.push(path);
  }
  return result;
}

function mime(path) {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return ({
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
  })[ext];
}

function run(args) {
  execFileSync(WRANGLER, args, {
    cwd: 'worker',
    stdio: 'inherit',
    env: process.env,
  });
}

const files = walk(ROOT).filter((path) => {
  const key = relative('.', path).replaceAll('\\', '/');
  return /^data\/[^/]+\/[a-z]\/[^/]+\/images\/[^/]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i.test(key);
});

console.log(`R2 image migration: ${files.length} image(s) found.`);
if (!files.length) process.exit(0);

for (const file of files) {
  const key = relative('.', file).replaceAll('\\', '/');
  const size = statSync(file).size;
  console.log(`Uploading ${key} (${size} bytes)`);
  run([
    'wrangler@4',
    'r2',
    'object',
    'put',
    `${BUCKET}/${key}`,
    `--file=../${key}`,
    `--content-type=${mime(file)}`,
    '--cache-control=public, max-age=31536000, immutable',
    '--remote',
  ]);
}

console.log(`R2 image migration complete: ${files.length} image(s) uploaded.`);
