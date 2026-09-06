import fs from 'node:fs';

const files = ['src/main.ts', 'src/management.ts', 'src/store.ts', 'src/api.ts', 'src/types.ts'];
const forbidden = /(?:item|entry)\.(?:release|shipping|material)\b/;
const violations = [];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (forbidden.test(source)) violations.push(file);
}
if (violations.length) {
  console.error('Legacy runtime field verification failed:');
  for (const file of violations) console.error(`- ${file}`);
  process.exit(1);
}
console.log('Legacy runtime field verification passed.');
