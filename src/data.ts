import type { WorkData, WorksFile, VersionInfo } from './types.ts';
import { validateVersion, validateWorkData, validateWorksFile } from './validation.ts';

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

function dataUrl(path: string): string {
  return new URL(path.replace(/^\/+/, ''), new URL(base, window.location.href)).toString();
}

async function loadJson<T>(path: string, validate: (value: unknown) => asserts value is T): Promise<T> {
  const response = await fetch(dataUrl(path), { headers: { Accept: 'application/json' }, cache: 'no-cache' });
  if (!response.ok) throw new Error(`資料載入失敗：${path} (${response.status})`);
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error(`資料格式無效：${path}`); }
  try {
    validate(value);
  } catch (error) {
    const detail = error instanceof Error ? error.message : '未知驗證錯誤';
    throw new Error(`資料驗證失敗：${path}。${detail}`);
  }
  return value;
}

export function loadWorks(): Promise<WorksFile> { return loadJson('data/works.json', validateWorksFile); }
export function loadVersion(): Promise<VersionInfo> { return loadJson('data/version.json', validateVersion); }
export function loadWorkData(path: string): Promise<WorkData> { return loadJson(path, validateWorkData); }
