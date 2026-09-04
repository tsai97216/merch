export type AppVersion = `${number}.${number}.${number}`;

type VersionResponse = { version?: unknown };

export async function loadVersion(): Promise<AppVersion> {
  const response = await fetch('/data/version.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Version request failed: ${response.status}`);
  const data = (await response.json()) as VersionResponse;
  if (typeof data.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(data.version)) {
    throw new Error('Invalid version metadata');
  }
  return data.version as AppVersion;
}
