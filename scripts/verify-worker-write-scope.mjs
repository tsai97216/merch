import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('worker/src/index.ts');
const source = fs.readFileSync(file, 'utf8');

const required = [
  ['atomic tree construction', /base_tree:\s*remote\.baseTreeSha/],
  ['commit parent pinning', /parents:\s*\[remote\.headSha\]/],
  ['non-force ref update', /force:\s*false/],
  ['target Item lookup', /remote\.items\.get\(id\)/],
  ['target Item data path', /data\/\$\{work\.id\}\/\$\{storageItem\.category\}\/\$\\{id\}\/data\.json/],
  ['category index update', /remote\.categories\.get\(newCategoryPath\)/],
  ['old category removal on move', /oldIndex\.items\.filter\(entry => entry\.id !== id\)/],
  ['target image ownership check', /entry\.workId !== parts\.workId \|\| entry\.item\.category !== parts\.category/],
  ['item data + image atomic write', /path: asset\.path, content: asset\.content, encoding: 'base64'.*path: entry\.path, content: jsonFile\(item\)/s],
  ['item deletion removes images', /for \(const path of remote\.paths\) if \(path\.startsWith\(prefix\)\) writes\.push\(\{ path, delete: true \}\)/],
  ['stale write rejection', /status === 422.*資料在寫入期間已被其他操作更新/s],
];

const failures = required.filter(([, pattern]) => !pattern.test(source));
if (failures.length) {
  console.error('Worker write-scope verification failed:');
  for (const [name] of failures) console.error(`- ${name}`);
  process.exit(1);
}

const forbidden = [
  ['force push', /force:\s*true/],
  ['direct branch ref PUT', /git\/refs\/heads\/.*method:\s*'PUT'/s],
];
const violations = forbidden.filter(([, pattern]) => pattern.test(source));
if (violations.length) {
  console.error('Worker write-scope verification found unsafe operations:');
  for (const [name] of violations) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Worker write-scope verification passed: ${required.length} invariants.`);
