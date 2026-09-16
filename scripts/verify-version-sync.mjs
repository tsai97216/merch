import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionJson = JSON.parse(fs.readFileSync('public/data/version.json', 'utf8'));
const workerSource = fs.readFileSync('worker/src/r2-entry.ts', 'utf8');

if (!/^\d+\.\d+\.\d+$/.test(String(packageJson.version || ''))) {
  console.error('Version verification failed: package.json has an invalid version.');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(String(versionJson.version || ''))) {
  console.error('Version verification failed: public/data/version.json has an invalid version.');
  process.exit(1);
}

const workerMatch = workerSource.match(/const WORKER_VERSION = '([^']+)';/);
if (!workerMatch || !/^\d+\.\d+\.\d+$/.test(workerMatch[1])) {
  console.error('Version verification failed: worker/src/r2-entry.ts has an invalid WORKER_VERSION.');
  process.exit(1);
}

const versions = {
  package: packageJson.version,
  publicData: versionJson.version,
  worker: workerMatch[1],
};

if (new Set(Object.values(versions)).size !== 1) {
  console.error(`Version verification failed: ${JSON.stringify(versions)}.`);
  process.exit(1);
}

console.log(`Version verification passed: ${versions.package}.`);
