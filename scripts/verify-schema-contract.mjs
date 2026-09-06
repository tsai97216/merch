import fs from 'node:fs';

const forbidden = ['shipping', 'material', 'release', 'workName', 'createdAt', 'updatedAt'];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'data.json') files.push(full);
  }
}
walk('data');
const errors = [];
for (const file of files) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const key of forbidden) if (key in value) errors.push(`${file}: forbidden field ${key}`);
    for (const key of ['id','workId','title','series','characters','category','manufacturer','quantity','status','description','notes','purchase','arrival','afterSales','images']) {
      if (!(key in value)) errors.push(`${file}: missing field ${key}`);
    }
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
  }
}
if (errors.length) {
  console.error('Persisted schema contract verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Persisted schema contract verification passed: ${files.length} Item files.`);
