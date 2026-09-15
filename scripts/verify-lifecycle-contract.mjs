import fs from 'node:fs';
import path from 'node:path';

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

const files = walk('src').filter((file) => /\.(?:ts|tsx)$/.test(file));
const lifecycleFlag = /dataset\.(?:bound|groupsBound|[A-Za-z0-9_$]*DelegationReady)\s*=/;
const violations = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  if (lifecycleFlag.test(source)) violations.push(file);
}

if (violations.length) {
  throw new Error(`Legacy dataset lifecycle flags found: ${violations.join(', ')}`);
}

console.log(`Lifecycle contract OK: scanned ${files.length} TypeScript source files.`);
