import fs from 'node:fs';

const source = fs.readFileSync('worker/src/index.ts', 'utf8');

function body(name) {
  const start = source.indexOf(`async function ${name}`);
  if (start < 0) throw new Error(`Missing worker function: ${name}`);
  const end = source.indexOf('\nasync function ', start + 20);
  return source.slice(start, end < 0 ? source.length : end);
}

const put = body('putAsset');
const del = body('deleteAsset');
if (!put.includes('const exists = remote.paths.has(asset.path)')) throw new Error('putAsset must distinguish add vs replace.');
if (!put.includes("if (!exists)")) throw new Error('new image must bump patch version.');
if (!put.includes("${exists ? 'fix: replace' : 'feat: add'} image")) throw new Error('image mutation message must distinguish replace/add.');
if (!del.includes('const nextVersion = bumpPatch(remote.version)')) throw new Error('delete image must bump patch version.');
if (!del.includes('{ path, delete: true }')) throw new Error('delete image must remove the physical asset atomically.');
if (!put.includes('path: entry.path, content: jsonFile(item)') || !del.includes('path: entry.path, content: jsonFile(item)')) throw new Error('image metadata and Item data must be committed together.');
if (!source.includes('function normalizeImages')) throw new Error('image metadata normalization is missing.');
if (!source.includes("一個 Item 只能有一張封面")) throw new Error('single-cover invariant is missing.');
console.log('Worker image semantics verification passed.');
