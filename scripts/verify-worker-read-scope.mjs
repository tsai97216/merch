import fs from 'node:fs';

const file = 'worker/src/index.ts';
if (!fs.existsSync(file)) throw new Error('Worker source not found.');
const source = fs.readFileSync(file, 'utf8');
if (!source.includes('async function loadRemoteTarget(env: Env, id: string)')) throw new Error('Target-scoped loader is missing.');
const mutationFns = ['updateItem', 'deleteItem', 'getAsset', 'putAsset', 'deleteAsset'];
for (const name of mutationFns) {
  const start = source.indexOf(`async function ${name}`);
  if (start < 0) throw new Error(`Missing mutation function: ${name}`);
  const end = source.indexOf('\nasync function ', start + 20);
  const body = source.slice(start, end < 0 ? source.length : end);
  if (body.includes('loadRemote(env)')) throw new Error(`${name} still performs full recursive remote loading.`);
}
console.log('Worker target-read scope verification passed.');
