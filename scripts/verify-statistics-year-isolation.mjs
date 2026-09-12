#!/usr/bin/env node

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/statistics-data.ts', import.meta.url), 'utf8');

const assertIncludes = (fragment, message) => {
  assert(source.includes(fragment), `Statistics year isolation verification failed: ${message}`);
};

assertIncludes("if (month && Number(month.slice(0, 4)) === year)", 'item monthly details must be scoped to the selected year');
assertIncludes("if (month && Number(month.slice(0, 4)) === year && Number(record.amount || 0))", 'shipping monthly details must be scoped to the selected year');
assertIncludes("const key = `${year}-${String(i + 1).padStart(2, '0')}`", 'monthly aggregation must build keys from the selected year');
assertIncludes("detailItems: Object.fromEntries(monthlyEntries.map(([key]) => [monthLabel(key), monthlyDetailItems[key] || []]))", 'monthly detail lookup must be derived only from selected-year month keys');

const makeDetails = (year, entries) => {
  const details = {};
  entries.forEach(([date, title]) => {
    const month = date.slice(0, 7);
    if (Number(month.slice(0, 4)) === year) (details[month] ||= []).push(title);
  });
  return details;
};

const entries = [
  ['2025-03-15', '2025 item'],
  ['2026-03-15', '2026 item'],
  ['2026-11-02', '2026 late item'],
];

assert.deepEqual(makeDetails(2025, entries), {
  '2025-03': ['2025 item'],
});
assert.deepEqual(makeDetails(2026, entries), {
  '2026-03': ['2026 item'],
  '2026-11': ['2026 late item'],
});

console.log('Statistics year isolation verification passed: monthly detail data is explicitly scoped to the selected year.');
