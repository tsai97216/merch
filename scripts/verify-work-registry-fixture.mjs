import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'merch-work-registry-'));

try {
  await fs.mkdir(path.join(fixtureRoot, 'data'), { recursive: true });
  await fs.mkdir(path.join(fixtureRoot, 'public', 'data'), { recursive: true });

  const worksIndex = JSON.parse(await fs.readFile(path.join(root, 'data', 'works.json'), 'utf8'));
  const versionData = JSON.parse(await fs.readFile(path.join(root, 'public', 'data', 'version.json'), 'utf8'));
  const fixtureWork = {
    id: 'fixture-work',
    name: 'Fixture Work',
    code: 'TST',
    path: 'data/fixture-work',
  };
  const fixtureItem = {
    id: 'TSTt999',
    workId: fixtureWork.id,
    title: 'Fixture Item',
    series: '',
    characters: [],
    category: 't',
    manufacturer: '',
    quantity: 1,
    status: 'owned',
    description: '',
    notes: '',
    purchase: {},
    arrival: {},
    afterSales: {},
    images: [],
  };

  worksIndex.works.push(fixtureWork);
  await fs.writeFile(
    path.join(fixtureRoot, 'data', 'works.json'),
    `${JSON.stringify(worksIndex, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureRoot, 'public', 'data', 'version.json'),
    `${JSON.stringify(versionData, null, 2)}\n`,
    'utf8',
  );

  const itemDir = path.join(fixtureRoot, 'data', fixtureWork.id, 't', fixtureItem.id);
  await fs.mkdir(itemDir, { recursive: true });
  await fs.writeFile(path.join(itemDir, 'data.json'), `${JSON.stringify(fixtureItem)}\n`, 'utf8');

  await execFileAsync(process.execPath, [path.join(root, 'scripts', 'generate-collection.mjs')], {
    cwd: root,
    env: { ...process.env, MERCH_ROOT: fixtureRoot },
  });

  const collection = JSON.parse(
    await fs.readFile(path.join(fixtureRoot, 'public', 'data', 'collection.json'), 'utf8'),
  );
  const generatedWork = collection.works.find((work) => work.id === fixtureWork.id);

  assert.ok(generatedWork, 'generated collection 必須自動包含新增 Work');
  assert.equal(generatedWork.name, fixtureWork.name, 'generated Work name 必須來自 registry');
  assert.equal(generatedWork.code, fixtureWork.code, 'generated Work code 必須來自 registry');
  assert.deepEqual(generatedWork.items, [
    { ...fixtureItem, workId: fixtureWork.id, workName: fixtureWork.name },
  ], 'generated collection 必須自動包含新增 Work 的 Item');

  console.log('Isolated Work registry fixture passed: new Work and Item propagated to generated collection.');
} finally {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}
