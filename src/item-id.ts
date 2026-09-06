export type ItemIdParts = {
  workCode: string;
  categoryCode: string;
  sequence: number;
};

/**
 * Permanent Item ID format:
 *   WORKCODE + category code + 3-digit sequence
 * Examples: GIa001, HSRf001, ZZZb001, WWk001
 */
const ITEM_ID_RE = /^([A-Z]{2,3})([a-z])(\d{3})$/;

export function parseItemId(id: string): ItemIdParts | null {
  const match = ITEM_ID_RE.exec(id);
  if (!match) return null;

  const sequence = Number(match[3]);
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) return null;

  return {
    workCode: match[1],
    categoryCode: match[2],
    sequence,
  };
}

export function isValidItemId(id: string): boolean {
  return parseItemId(id) !== null;
}

export function buildItemId(workCode: string, categoryCode: string, sequence: number): string {
  const work = workCode.trim().toUpperCase();
  const category = categoryCode.trim().toLowerCase();

  if (!/^[A-Z]{2,3}$/.test(work)) throw new Error(`無效作品代碼：${workCode}`);
  if (!/^[a-z]$/.test(category)) throw new Error(`無效類別代碼：${categoryCode}`);
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) {
    throw new Error(`流水號必須介於 001～999：${sequence}`);
  }

  return `${work}${category}${String(sequence).padStart(3, '0')}`;
}

export function getItemGroupKey(id: string): string | null {
  const parsed = parseItemId(id);
  return parsed ? `${parsed.workCode}${parsed.categoryCode}` : null;
}

export function getNextSequence(ids: Iterable<string>, workCode: string, categoryCode: string): number {
  const work = workCode.trim().toUpperCase();
  const category = categoryCode.trim().toLowerCase();
  let max = 0;

  for (const id of ids) {
    const parsed = parseItemId(id);
    if (parsed?.workCode === work && parsed.categoryCode === category) {
      max = Math.max(max, parsed.sequence);
    }
  }

  return max + 1;
}

export function buildNextItemId(ids: Iterable<string>, workCode: string, categoryCode: string): string {
  return buildItemId(workCode, categoryCode, getNextSequence(ids, workCode, categoryCode));
}

/** Paths are derived only from the permanent Item ID and current storage location. */
export function buildItemStoragePaths(workId: string, category: string, itemId: string) {
  const base = `data/${workId}/${category}/${itemId}`;
  return {
    dataPath: `${base}/data.json`,
    imagesPath: `${base}/images`,
    categoryIndexPath: `data/${workId}/${category}/index.json`,
  } as const;
}
