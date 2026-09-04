import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface Work { id: string; name: string; data: string }
interface WorksFile { schemaVersion: number; works: Work[] }
interface Image { id: string; path: string; url: string; sha: string; alt: string; isCover: boolean }
interface Item { id: string; workId: string; images: Image[]; [key: string]: unknown }
interface WorkData { schemaVersion: number; work: string; name: string; updatedAt: string; items: Item[] }

const root = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(root, '..', 'merch-old');
const targetRoot = resolve(root, 'public');

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function validateWorks(source: WorksFile): void {
  assert(Array.isArray(source.works), 'works must be an array');
  assert(source.works.length === 4, `expected 4 works, got ${source.works.length}`);
  const ids = new Set<string>();
  for (const work of source.works) {
    assert(work.id && work.name && work.data, 'work has missing required fields');
    assert(!ids.has(work.id), `duplicate work id: ${work.id}`);
    ids.add(work.id);
  }
}

function validateData(data: WorkData, work: Work, itemIds: Set<string>, imageShas: Set<string>): void {
  assert(data.work === work.id, `work mismatch: ${work.id}`);
  assert(Array.isArray(data.items), `items must be an array: ${work.id}`);
  for (const item of data.items) {
    assert(item.id && item.workId === work.id, `invalid item reference: ${item.id}`);
    assert(!itemIds.has(item.id), `duplicate item id: ${item.id}`);
    itemIds.add(item.id);
    assert(Array.isArray(item.images), `images must be an array: ${item.id}`);
    for (const image of item.images) {
      assert(image.id && image.path && image.sha, `invalid image metadata: ${item.id}`);
      assert(!imageShas.has(image.sha), `duplicate image sha: ${image.sha}`);
      imageShas.add(image.sha);
    }
  }
}

async function main(): Promise<void> {
  const sourceWorks = await readJson<WorksFile>(resolve(sourceRoot, 'data/works.json'));
  validateWorks(sourceWorks);

  const itemIds = new Set<string>();
  const imageShas = new Set<string>();
  const migrated: WorkData[] = [];

  for (const work of sourceWorks.works) {
    const data = await readJson<WorkData>(resolve(sourceRoot, work.data));
    validateData(data, work, itemIds, imageShas);
    migrated.push(data);
  }

  const result = {
    sourceRepository: 'tsai97216/merch-old',
    sourceRef: 'main',
    targetRepository: 'tsai97216/merch',
    targetRef: 'main',
    workCount: sourceWorks.works.length,
    itemCount: migrated.reduce((sum, data) => sum + data.items.length, 0),
    imageCount: migrated.reduce((sum, data) => sum + data.items.reduce((sumImages, item) => sumImages + item.images.length, 0), 0),
    itemIds: [...itemIds],
    imageShas: [...imageShas],
    verified: true,
  };

  const targetWorks = { schemaVersion: sourceWorks.schemaVersion, works: sourceWorks.works };
  const existingTargetWorks = await readJson<WorksFile>(resolve(targetRoot, 'data/works.json'));
  assert(JSON.stringify(existingTargetWorks) === JSON.stringify(targetWorks), 'target works.json differs from source');

  for (const data of migrated) {
    const existing = await readJson<WorkData>(resolve(targetRoot, data.work, 'data.json'));
    assert(JSON.stringify(existing) === JSON.stringify(data), `target data differs from source: ${data.work}`);
  }

  await writeFile(resolve(root, 'tools/migration-result.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

await main();
