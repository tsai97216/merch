import './admin-auth';

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

async function renderVersion(): Promise<void> {
  try {
    const version = await loadVersion();
    document.querySelectorAll<HTMLElement>('.version').forEach((element) => {
      element.textContent = `v${version}`;
    });
  } catch (error) {
    console.error('Failed to load version metadata:', error);
  }
}

void renderVersion();
