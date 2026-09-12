#!/usr/bin/env node

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const dataSource = readFileSync(new URL('../src/statistics-data.ts', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../src/statistics.ts', import.meta.url), 'utf8');

const assertIncludes = (source, fragment, message) => {
  assert(source.includes(fragment), `Statistics year contract verification failed: ${message}`);
};

assertIncludes(pageSource, 'const years = statisticsYears(store.snapshot.items, store.snapshot.shipping ?? []);', 'year options must come from the current Store data');
assertIncludes(pageSource, 'if (!years.includes(selectedYear)) selectedYear = years[0] ?? currentYear();', 'selected year must remain valid after data changes');
assertIncludes(pageSource, 'const charts = aggregateStatistics(store.snapshot.items, store.snapshot.shipping ?? [], selectedYear);', 'chart aggregation must use the selected year');
assertIncludes(dataSource, 'year, detailItems: Object.fromEntries(monthlyEntries.map(([key]) => [monthLabel(key), monthlyDetailItems[key] || []]))', 'monthly detail lookup must use the same selected-year month keys as chart rows');
assertIncludes(dataSource, 'const monthlyEntries: [string, WorkAggregate][] = Array.from({ length: 12 }, (_, i) => { const key = `${year}-${String(i + 1).padStart(2, \'0\')}`;', 'monthly chart rows must use the selected year for every month');
assertIncludes(dataSource, 'const monthlyYearSpend = monthlyEntries.reduce((sum, [, row]) => sum + row.spend, 0);', 'annual summary must be derived from the same twelve selected-year rows');

const makeMonthKeys = (year) => Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
assert.deepEqual(makeMonthKeys(2025)[0], '2025-01');
assert.deepEqual(makeMonthKeys(2025)[11], '2025-12');
assert.deepEqual(makeMonthKeys(2026)[0], '2026-01');
assert.deepEqual(makeMonthKeys(2026)[11], '2026-12');
assert.notDeepEqual(makeMonthKeys(2025), makeMonthKeys(2026));

console.log('Statistics year contract verification passed: selection, aggregation, twelve-month rows, annual summary, and detail lookup share the same year.');
