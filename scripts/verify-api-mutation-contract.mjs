#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const assert = (condition, message) => { if (!condition) throw new Error(`API mutation verification failed: ${message}`); };
const item = { id: 'TESTc001', workId: 'test-work', title: 'Test Item', series: [], characters: [], category: 'other', manufacturer: 'Test', quantity: 1, status: 'received', description: '', notes: '', purchase: {}, arrival: {}, afterSales: {}, images: [] };
const collection = (version = '1.109.283') => ({ version, works: [{ id: 'test-work', name: 'Test Work', code: 'TEST', items: [item] }], shipping: [] });
const makeResponse = (status, payload) => ({ ok: status >= 200 && status < 300, status, async json() { return payload; } });
const originalFetch = globalThis.fetch;
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'merch-mutation-verify-'));
try {
  const apiSource = await fs.readFile(path.join(root, 'src', 'api.ts'), 'utf8');
  const errorSource = await fs.readFile(path.join(root, 'src', 'error.ts'), 'utf8');
  const transpile = (source, fileName) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, verbatimModuleSyntax: true, sourceMap: false }, fileName }).outputText;
  await fs.writeFile(path.join(tempDir, 'error.mjs'), transpile(errorSource, 'error.ts'), 'utf8');
  await fs.writeFile(path.join(tempDir, 'api.mjs'), transpile(apiSource, 'api.ts').replace("from './error'", "from './error.mjs'"), 'utf8');
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const run = async (operation, responses) => {
    const calls = [];
    globalThis.fetch = async (input, init = {}) => { const url = String(input); calls.push({ url, init }); const response = responses[url]; if (!response) throw new Error(`Unexpected fetch: ${url}`); return response; };
    const api = await import(`${pathToFileURL(path.join(tempDir, 'api.mjs')).href}?case=${Math.random()}`);
    return { result: await operation(api), calls };
  };

  let result = await run(api => api.putItem({ ...item, workName: 'Test Work' }), {
    '/api/items/TESTc001': makeResponse(200, { ok: true, data: { version: '1.109.283' } }),
    './data/collection.json': makeResponse(200, collection()), './data/shipping.json': makeResponse(200, { schemaVersion: 1, records: [] }),
  });
  const putBody = JSON.parse(result.calls.find(call => call.url === '/api/items/TESTc001').init.body);
  assert(!('workName' in putBody.item), 'PUT Item must not persist runtime workName');
  assert(putBody.item.purchase && putBody.item.arrival && putBody.item.afterSales && Array.isArray(putBody.item.images), 'PUT Item must preserve canonical nested schema');
  assert(result.result.version === '1.109.283', 'PUT Item must return validated remote data');

  result = await run(api => api.deleteItem('TESTc001'), { '/api/items/TESTc001': makeResponse(200, { ok: true, data: { version: '1.109.283' } }), './data/collection.json': makeResponse(200, collection()), './data/shipping.json': makeResponse(200, { schemaVersion: 1, records: [] }) });
  assert(result.calls[0].url === '/api/items/TESTc001', 'DELETE Item must target the exact permanent Item ID');
  assert(result.result.works.length === 1, 'DELETE mutation must re-read validated remote data');

  result = await run(api => api.putShipping({ id: 'ship-1', amount: 25, currency: 'TWD', itemIds: ['TESTc001'] }), { '/api/shipping/ship-1': makeResponse(200, { ok: true, data: { version: '1.109.283' } }), './data/collection.json': makeResponse(200, collection()), './data/shipping.json': makeResponse(200, { schemaVersion: 1, records: [{ id: 'ship-1', amount: 25, currency: 'TWD', itemIds: ['TESTc001'] }] }) });
  const shippingBody = JSON.parse(result.calls.find(call => call.url === '/api/shipping/ship-1').init.body);
  assert(shippingBody.shipping.id === 'ship-1' && shippingBody.shipping.itemIds[0] === 'TESTc001', 'PUT Shipping must preserve its canonical relation');
  assert(result.result.shipping[0].id === 'ship-1', 'PUT Shipping must return validated remote data');

  for (const badPayload of [{ version: 'not-a-version' }, { version: '1.109' }, { version: 1 }]) {
    let failed = false;
    try { await run(api => api.putItem({ ...item }), { '/api/items/TESTc001': makeResponse(200, { ok: true, data: badPayload }) }); } catch { failed = true; }
    assert(failed, 'mutation response with invalid version must be rejected');
  }
  console.log('API mutation verification passed: Item PUT/DELETE, Shipping PUT, runtime-field stripping, canonical nested payloads, and mutation response validation.');
} finally {
  if (originalFetch) globalThis.fetch = originalFetch; else delete globalThis.fetch;
  delete globalThis.window; delete globalThis.sessionStorage;
  await fs.rm(tempDir, { recursive: true, force: true });
}
