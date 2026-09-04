import type { WorkData, WorksFile, VersionInfo } from './types.ts';
import { validateVersion, validateWorkData, validateWorksFile } from './validation.ts';

async function loadJson<T>(path: string, validate: (value: unknown) => asserts value is T): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`資料載入失敗：${path} (${response.status})`);

  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new Error(`資料格式無效：${path}`);
  }

  validate(value);
  return value;
}

export async function loadWorks(): Promise<WorksFile> {
  return loadJson<WorksFile>('/data/works.json', validateWorksFile);
}

export async function loadVersion(): Promise<VersionInfo> {
  return loadJson<VersionInfo>('/data/version.json', validateVersion);
}

export async function loadWorkData(path: string): Promise<WorkData> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return loadJson<WorkData>(normalized, validateWorkData);
}
