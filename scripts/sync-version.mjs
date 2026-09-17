#!/usr/bin/env node

import fs from 'node:fs/promises';

const packagePath = 'package.json';
const versionPath = 'public/data/version.json';

const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
const version = String(packageJson.version || '');

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Version sync failed: package.json has an invalid version: ${version || '(empty)'}.`);
  process.exit(1);
}

const content = `${JSON.stringify({ version }, null, 2)}\n`;
await fs.writeFile(versionPath, content, 'utf8');
console.log(`Version metadata synchronized from package.json: ${version}.`);
