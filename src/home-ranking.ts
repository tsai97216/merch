export type CharacterRankingRow = [character: string, spending: number];

export function rankAt(rows: CharacterRankingRow[], index: number): number {
  if (index === 0) return 1;
  return rows[index][1] === rows[index - 1][1] ? rankAt(rows, index - 1) : index + 1;
}

export function sortCharacterRanking(rows: CharacterRankingRow[]): CharacterRankingRow[] {
  return [...rows].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'));
}
