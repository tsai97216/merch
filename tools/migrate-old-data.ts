import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface Work { id: string; name: string; data: string }
interface WorksFile { schemaVersion: number; works: Work[] }
interface Item { id: string; workId: string; images: Image[]; [key: string]: unknown }
interface Image { id: string; path: string; url: string; sha: string; alt: string; isCover: boolean }
interface WorkData { schemaVersion: number; work: string; name: string; updatedAt: string; items: Item[] }

const root = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(root, '..', 'merch-old');
const targetRoot = resolve(root, 'public');

async function json<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const sourceWorks = await json<WorksFile>(resolve(sourceRoot, 'data/works.json'));
  assert(sourceWorks.works.length === 4, `expected 4 works, got ${sourceWorks.works.length}`);

  const migrated: WorkData[] = [];
  const itemIds = new Set<string>();
  const imageShas = new Set<string>();

  for (const work of sourceWorks.works) {
    const data = await json<WorkData>(resolve(sourceRoot, work.data));
    assert(data.work === work.id, `work mismatch: ${work.id}`);
    for (const item of data.items) {
      assert(item.workId === work.id, `item ${item.id} has wrong workId`);
      assert(!itemIds.has(item.id), `duplicate item id: ${item.id}`);
      itemIds.add(item.id);
      for (const image of item.images) {
        assert(!imageShas.has(image.sha), `duplicate image sha: ${image.sha}`);
        imageShas.add(image.sha);
      }
    }
    migrated.push(data);
  }

  const targetWorks = { schemaVersion: sourceWorks.schemaVersion, works: sourceWorks.works };
  await writeFile(resolve(targetRoot, 'data/works.json'), `${JSON.stringify(targetWorks, null, 2)}\n`);
  for (const data of migrated) {
    await writeFile(resolve(targetRoot, data.work, 'data.json'), `${JSON.stringify(data, null, 2)}\n`);
  }

  const manifest = {
    sourceRepository: 'tsai97216/merch-old',
    sourceRef: 'main',
    workCount: sourceWorks.works.length,
    itemCount: [...migrated].reduce((sum, data) => sum + data.items.length, 0),
    imageCount: [...migrated].reduce((sum, data) => sum + data.items.reduce((n, item) => n + item.images.length, 0), 0),
    itemIds: [...itemIds],
    imageShas: [...imageShas],
  };
  await writeFile(resolve(root, 'tools/migration-result.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
}

await main();
