import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/verify.yml', 'utf8');
const scripts = packageJson.scripts ?? {};
const verifyScripts = Object.entries(scripts)
  .filter(([name]) => name.startsWith('verify'))
  .map(([name]) => name);

const missing = verifyScripts.filter((name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return !new RegExp(`npm\\s+run\\s+${escaped}(?:\\s|$)`).test(workflow);
});

if (missing.length) {
  throw new Error(`CI workflow is missing verification scripts: ${missing.join(', ')}`);
}

if (!workflow.includes('npm run build')) {
  throw new Error('CI workflow is missing the production build step.');
}

console.log(`CI contract OK: ${verifyScripts.length} verification scripts are wired into verify.yml.`);
