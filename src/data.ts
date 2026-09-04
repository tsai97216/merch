import type { WorkData, WorksFile, VersionInfo } from './types.ts';
import { validateVersion, validateWorkData, validateWorksFile } from './validation.ts';

function resolveDataPath(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return new URL(clean, window.location.origin + import.meta.env.BASE_URL).toString();
}

async function readJson<T>(path: string, validate: (value: unknown) => asserts value is T): Promise<T> {
  const response = await fetch(resolveDataPath(path), { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`無法載入 ${path}：HTTP ${response.status}`);
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error(`無法解析 ${path}：JSON 格式錯誤`); }
  try { validate(value); } catch (error) { throw new Error(error instanceof Error ? error.message : `資料驗證失敗：${path}`); }
  return value;
}

export const loadWorks = () => readJson<WorksFile>('data/works.json', validateWorksFile);
export const loadVersion = () => readJson<VersionInfo>('data/version.json', validateVersion);
export const loadWorkData = (path: string) => readJson<WorkData>(path, validateWorkData);
