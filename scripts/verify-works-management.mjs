import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const api = read('src/api.ts');
const ui = read('src/works-management.ts');
const worker = read('worker/src/index.ts');

const required = [
  ['src/api.ts', /export async function createWork\(/, 'createWork API'],
  ['src/api.ts', /export async function updateWork\(/, 'updateWork API'],
  ['src/api.ts', /export async function deleteWork\(/, 'deleteWork API'],
  ['src/api.ts', /request\('\/works/, 'work API route'],
  ['src/works-management.ts', /createWork\(/, 'create work UI action'],
  ['src/works-management.ts', /updateWork\(/, 'edit work UI action'],
  ['src/works-management.ts', /deleteWork\(/, 'delete work UI action'],
  ['worker/src/index.ts', /async function createWork\(/, 'worker createWork handler'],
  ['worker/src/index.ts', /async function updateWork\(/, 'worker updateWork handler'],
  ['worker/src/index.ts', /async function deleteWork\(/, 'worker deleteWork handler'],
  ['worker/src/index.ts', /createAtomicCommit\(/, 'atomic work commit'],
  ['worker/src/index.ts', /force:\s*false/, 'non-force branch update'],
];

const contents = {
  'src/api.ts': api,
  'src/works-management.ts': ui,
  'worker/src/index.ts': worker,
};

const errors = [];
for (const [file, pattern, label] of required) {
  if (!pattern.test(contents[file])) errors.push(`${file}: missing ${label}`);
}

const hasWorkItemCollection = /remote\.items|items\.values\(\)|filter\(entry => entry\.workId/.test(worker);
const hasDeleteGuard = /cannot|不可|不能|有收藏|收藏.*刪除|items.*workId|workId.*items/.test(worker);
if (!hasWorkItemCollection || !hasDeleteGuard) {
  errors.push('worker/src/index.ts: missing explicit work item-count handling');
}

if (!/editingId/.test(ui) || !/immutable|不可|不能|disabled/.test(ui)) {
  errors.push('src/works-management.ts: missing explicit edit-state / immutable work-code handling');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Works management CRUD contract: PASS');
