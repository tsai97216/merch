import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionJson = JSON.parse(fs.readFileSync('public/data/version.json', 'utf8'));

if (!/^\d+\.\d+\.\d+$/.test(String(versionJson.version || ''))) {
  console.error('Version verification failed: public/data/version.json has an invalid version.');
  process.exit(1);
}

if (packageJson.version !== versionJson.version) {
  console.error(`Version verification failed: package.json=${packageJson.version}, version.json=${versionJson.version}.`);
  process.exit(1);
}

console.log(`Version verification passed: ${versionJson.version}.`);
