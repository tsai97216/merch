import { strict as assert } from 'node:assert';

function rankAt(rows, index) {
  if (index === 0) return 1;
  return rows[index][1] === rows[index - 1][1] ? rankAt(rows, index - 1) : index + 1;
}

function sortCharacterRanking(rows) {
  return [...rows].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'));
}

const rows = sortCharacterRanking([
  ['乙', 2],
  ['甲', 5],
  ['丙', 5],
  ['丁', 2],
  ['戊', 1],
]);

assert.deepEqual(rows.map(([name]) => name), ['丙', '甲', '丁', '乙', '戊']);
assert.deepEqual(rows.map((_, index) => rankAt(rows, index)), [1, 1, 3, 3, 5]);

const tieAfterTop = sortCharacterRanking([
  ['A', 4],
  ['B', 4],
  ['C', 2],
  ['D', 2],
  ['E', 1],
]);
assert.deepEqual(tieAfterTop.map((_, index) => rankAt(tieAfterTop, index)), [1, 1, 3, 3, 5]);

console.log('Home character ranking contract passed.');
