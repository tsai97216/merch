import { strict as assert } from 'node:assert';

function rankAt(rows, index) {
  if (index === 0) return 1;
  return rows[index][1] === rows[index - 1][1] ? rankAt(rows, index - 1) : index + 1;
}

function sortCharacterRanking(rows) {
  return [...rows].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'));
}

const rows = sortCharacterRanking([
  ['乙', 200],
  ['甲', 500],
  ['丙', 500],
  ['丁', 200],
  ['戊', 100],
]);

assert.deepEqual(rows.map(([name]) => name), ['丙', '甲', '丁', '乙', '戊']);
assert.deepEqual(rows.map((_, index) => rankAt(rows, index)), [1, 1, 3, 3, 5]);

const tieAfterTop = sortCharacterRanking([
  ['A', 400],
  ['B', 400],
  ['C', 200],
  ['D', 200],
  ['E', 100],
]);
assert.deepEqual(tieAfterTop.map((_, index) => rankAt(tieAfterTop, index)), [1, 1, 3, 3, 5]);

function allocateItemSpending(characters, value) {
  const uniqueCharacters = [...new Set(characters.map((character) => String(character).trim()).filter(Boolean))];
  if (!uniqueCharacters.length) return [];
  const share = value / uniqueCharacters.length;
  return uniqueCharacters.map((character) => [character, share]);
}

const allocated = allocateItemSpending(['流螢', '流螢', '銀狼'], 1000);
assert.deepEqual(allocated, [['流螢', 500], ['銀狼', 500]]);

console.log('Home character spending ranking contract passed.');
