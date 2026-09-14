import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'data');
const BUCKET = process.env.R2_BUCKET || 'chi-merch-assets';
const VERSION = '1.109.409';

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
const mimeTypes = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif'
};

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: 'inherit', ...options });
}

function runWrangler(args) {
  run('npx', ['wrangler@4', ...args], { cwd: path.join(ROOT, 'worker') });
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function canonicalName(itemId, extension, index) {
  return `${itemId}${index === 0 ? '' : `-${index + 1}`}.${extension}`;
}

function r2Put(key, file, extension) {
  runWrangler(['r2', 'object', 'put', `${BUCKET}/${key}`, `--file=../${path.relative(ROOT, file).replaceAll('\\', '/')}`, `--content-type=${mimeTypes[extension]}`, '--cache-control=public, max-age=31536000, immutable', '--remote']);
}

function r2GetVerify(key, tempFile) {
  runWrangler(['r2', 'object', 'get', `${BUCKET}/${key}`, `--file=${tempFile}`, '--remote']);
}

function r2Delete(key) {
  runWrangler(['r2', 'object', 'delete', `${BUCKET}/${key}`, '--remote']);
}

const dataFiles = (await walk(DATA_ROOT)).filter(file => path.basename(file) === 'data.json');
const migrations = [];

for (const dataFile of dataFiles) {
  const item = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  if (!item?.id || !Array.isArray(item.images)) continue;

  const itemDir = path.dirname(dataFile);
  const imageDir = path.join(itemDir, 'images');
  for (let index = 0; index < item.images.length; index += 1) {
    const image = item.images[index];
    const oldFile = String(image.file || '').trim();
    const extension = oldFile.split('.').pop()?.toLowerCase() || '';
    if (!oldFile || !imageExtensions.has(extension)) throw new Error(`Invalid image filename for ${item.id}: ${oldFile}`);

    const nextFile = canonicalName(item.id, extension, index);
    const oldPath = path.join(imageDir, oldFile);
    const nextPath = path.join(imageDir, nextFile);
    const keyBase = `data/${item.workId}/${item.category}/${item.id}/images/`;
    migrations.push({ item, dataFile, image, oldFile, nextFile, oldPath, nextPath, oldKey: `${keyBase}${oldFile}`, nextKey: `${keyBase}${nextFile}`, extension });
  }
}

const oldPaths = new Set(migrations.map(entry => path.resolve(entry.oldPath)));
for (const entry of migrations) {
  if (entry.oldFile === entry.nextFile) continue;
  if (!(await fs.stat(entry.oldPath).catch(() => null))) throw new Error(`Missing image file: ${entry.oldPath}`);
  const existingTarget = await fs.stat(entry.nextPath).catch(() => null);
  if (existingTarget && !oldPaths.has(path.resolve(entry.nextPath))) throw new Error(`Target already exists outside migration set: ${entry.nextPath}`);
}

const tempEntries = [];
for (let index = 0; index < migrations.length; index += 1) {
  const entry = migrations[index];
  if (entry.oldFile === entry.nextFile) continue;
  const tempPath = `${entry.oldPath}.migration-${process.pid}-${index}.tmp`;
  await fs.rename(entry.oldPath, tempPath);
  tempEntries.push({ entry, tempPath });
}
for (const { entry, tempPath } of tempEntries) await fs.rename(tempPath, entry.nextPath);

const changedData = new Map();
for (const entry of migrations) {
  if (entry.image.file !== entry.nextFile) {
    entry.image.file = entry.nextFile;
    changedData.set(entry.dataFile, entry.item);
  }
}
for (const [dataFile, item] of changedData) await fs.writeFile(dataFile, `${JSON.stringify(item, null, 2)}\n`, 'utf8');

const managementPath = path.join(ROOT, 'src/management.ts');
let management = await fs.readFile(managementPath, 'utf8');
const previous = "function imageFileName(item: Item, extension: string, index: number): string { const serial = serialOf(item); return `${serial}${index === 0 ? '' : `-${index + 1}`}.${extension}`; }";
const replacement = "function imageFileName(item: Item, extension: string, index: number): string { const base = item.id; return `${base}${index === 0 ? '' : `-${index + 1}`}.${extension}`; }";
if (!management.includes(previous)) throw new Error('Expected management image filename implementation was not found.');
management = management.replace(previous, replacement);
await fs.writeFile(managementPath, management, 'utf8');

const packagePath = path.join(ROOT, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
packageJson.version = VERSION;
await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

const versionPath = path.join(ROOT, 'public/data/version.json');
await fs.writeFile(versionPath, `${JSON.stringify({ version: VERSION }, null, 2)}\n`, 'utf8');

const todoPath = path.join(ROOT, 'TODO.md');
let todo = await fs.readFile(todoPath, 'utf8');
todo = todo.replace(/目前開發版本：`[^`]+`/, `目前開發版本：\`${VERSION}\``);
todo = todo.replace('- [ ] 建立既有圖片檔名遷移方案，將目前 metadata 與實體圖片同步改為新的編號檔名規則後，再重新驗證 GitHub 與 R2 對應關係。', '- [x] 建立既有圖片檔名遷移方案，將目前 metadata 與實體圖片同步改為完整 Item ID 檔名規則，並同步驗證 GitHub 與 R2 對應關係。');
await fs.writeFile(todoPath, todo, 'utf8');

for (const entry of migrations) {
  if (entry.oldFile === entry.nextFile) continue;
  r2Put(entry.nextKey, entry.nextPath, entry.extension);
  const verifyFile = path.join('/tmp', `r2-verify-${entry.item.id}-${entry.nextFile}`);
  await fs.rm(verifyFile, { force: true });
  r2GetVerify(entry.nextKey, verifyFile);
  const stat = await fs.stat(verifyFile);
  if (stat.size <= 0) throw new Error(`R2 verification returned an empty file: ${entry.nextKey}`);
  await fs.rm(verifyFile, { force: true });
}

for (const entry of migrations) {
  if (entry.oldFile === entry.nextFile) continue;
  r2Delete(entry.oldKey);
}

run('npm', ['run', 'verify:version']);
run('npm', ['run', 'verify:images']);
run('npm', ['run', 'build']);

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', 'data', 'src/management.ts', 'package.json', 'public/data/version.json', 'TODO.md']);
run('git', ['commit', '-m', `chore: migrate image filenames to item ids (${VERSION})`]);
run('git', ['push', 'origin', 'HEAD:main']);

console.log(`Image filename migration complete: ${migrations.length} image(s) checked.`);
