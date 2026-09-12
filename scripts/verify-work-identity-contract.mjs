import fs from 'node:fs';

const assert = (condition, message) => {
  if (!condition) throw new Error(`Work identity contract verification failed: ${message}`);
};

const index = JSON.parse(fs.readFileSync('data/works.json', 'utf8'));
const worker = fs.readFileSync('worker/src/index.ts', 'utf8');
const workIdRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const workCodeRe = /^[A-Z]{2,3}$/;

assert(index.schemaVersion === 2, 'works.json schemaVersion 必須為 2');
assert(Array.isArray(index.works), 'works.json works 必須是陣列');

const ids = new Set();
const codes = new Set();
const paths = new Set();
for (const work of index.works) {
  assert(work && typeof work === 'object', 'Work entry 必須是 object');
  assert(typeof work.id === 'string' && workIdRe.test(work.id), `Work ID 格式無效：${work?.id}`);
  assert(typeof work.code === 'string' && workCodeRe.test(work.code), `Work Code 格式無效：${work?.code}`);
  assert(typeof work.name === 'string' && work.name.trim(), `Work name 無效：${work?.id}`);
  assert(work.path === `data/${work.id}`, `Work path 必須由永久 ID 決定：${work?.id}`);
  assert(!ids.has(work.id), `Work ID 重複：${work.id}`);
  assert(!codes.has(work.code), `Work Code 重複：${work.code}`);
  assert(!paths.has(work.path), `Work path 重複：${work.path}`);
  ids.add(work.id);
  codes.add(work.code);
  paths.add(work.path);
}

assert(/if \(remote\.index\.works\.some\(x => x\.id === work\.id\)\)/.test(worker), 'createWork 必須檢查 Work ID 衝突');
assert(/if \(remote\.index\.works\.some\(x => x\.code === work\.code\)\)/.test(worker), 'createWork 必須檢查 Work Code 衝突');
assert(/path: `data\/\$\{work\.id\}`/.test(worker), '新增 Work path 必須由 Work ID 派生');
assert(/if \(remote\.index\.works\.some\(x => x\.code === work\.code && x\.id !== id\)\)/.test(worker), 'updateWork 必須檢查 Work Code 衝突');
assert(/if \(hasItems && work\.code !== current\.code\)/.test(worker), '已有 Item 的 Work 不得任意修改 Code');

console.log(`Work identity contract verification passed: ${index.works.length} works, unique ID/Code/path and CRUD conflict guards.`);
