import fs from 'node:fs';

const forbidden = ['shipping', 'material', 'release', 'workName', 'createdAt', 'updatedAt'];
const required = ['id','workId','title','series','characters','category','manufacturer','quantity','status','description','notes','purchase','arrival','afterSales','images'];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'data.json') files.push(full);
  }
}
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
walk('data');
const errors = [];
for (const file of files) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!isObject(value)) {
      errors.push(`${file}: Item root 必須是 object`);
      continue;
    }
    for (const key of forbidden) if (key in value) errors.push(`${file}: forbidden field ${key}`);
    for (const key of required) if (!(key in value)) errors.push(`${file}: missing field ${key}`);
    if (!Array.isArray(value.series) || value.series.some((entry) => typeof entry !== 'string')) errors.push(`${file}: series 必須是字串陣列`);
    if (!Array.isArray(value.characters) || value.characters.some((entry) => typeof entry !== 'string')) errors.push(`${file}: characters 必須是字串陣列`);
    if (!Number.isInteger(value.quantity) || value.quantity < 1) errors.push(`${file}: quantity 必須是 >= 1 的整數`);
    for (const key of ['purchase', 'arrival', 'afterSales']) {
      if (!isObject(value[key])) errors.push(`${file}: ${key} 必須是 object`);
    }
    if (!Array.isArray(value.images)) {
      errors.push(`${file}: images 必須是陣列`);
    } else {
      const imageIds = new Set();
      for (const image of value.images) {
        if (!isObject(image)) { errors.push(`${file}: images 存在無效 metadata`); continue; }
        if (typeof image.id !== 'string' || !image.id) errors.push(`${file}: image.id 必須是非空字串`);
        else if (imageIds.has(image.id)) errors.push(`${file}: image.id 重複：${image.id}`);
        else imageIds.add(image.id);
        if (typeof image.file !== 'string' || !image.file) errors.push(`${file}: image.file 必須是非空字串`);
      }
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
