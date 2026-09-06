import fs from 'node:fs';

const source = fs.readFileSync('worker/src/index.ts', 'utf8');
const required = [
  'async function createAtomicCommit',
  'base_tree: remote.baseTreeSha',
  'parents: [remote.headSha]',
  'force: false',
  'async function updateItem',
  'async function deleteItem',
  'async function putAsset',
  'async function deleteAsset',
  'await createAtomicCommit(env, remote, writes,',
];
const missing = required.filter(pattern => !source.includes(pattern));
if (missing.length) {
  console.error('Worker transaction verification failed. Missing:');
  for (const pattern of missing) console.error(`- ${pattern}`);
  process.exit(1);
}

const mutationNames = ['updateItem', 'deleteItem', 'putAsset', 'deleteAsset'];
for (const name of mutationNames) {
  const start = source.indexOf(`async function ${name}`);
  const next = source.indexOf('\nasync function ', start + 1);
  const body = source.slice(start, next < 0 ? source.length : next);
  if (!body.includes('createAtomicCommit(env, remote,')) {
    console.error(`Worker transaction verification failed: ${name} 沒有透過 createAtomicCommit 寫入。`);
    process.exit(1);
  }
}

if (/update-ref[^\n]*force:\s*true/i.test(source) || /force:\s*true/.test(source)) {
  console.error('Worker transaction verification failed: 禁止 force ref update。');
  process.exit(1);
}

if (!source.includes("status === 422") && !source.includes('status === 422')) {
  console.error('Worker transaction verification failed: 缺少 stale ref 422 protection。');
  process.exit(1);
}

console.log('Worker transaction verification passed.');
