import type { WorkData, WorksFile, VersionInfo } from './types.ts';

async function loadJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`資料載入失敗：${path} (${response.status})`);
  return response.json() as Promise<T>;
}

export async function loadWorks(): Promise<WorksFile> {
  return loadJson<WorksFile>('/data/works.json');
}

export async function loadVersion(): Promise<VersionInfo> {
  return loadJson<VersionInfo>('/data/version.json');
}

export async function loadWorkData(path: string): Promise<WorkData> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return loadJson<WorkData>(normalized);
}
