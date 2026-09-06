const API_BASE = ((import.meta as ImportMeta & { env?: { VITE_MERCH_API_URL?: string } }).env?.VITE_MERCH_API_URL || '/api').replace(/\/$/, '');
const API_ASSET_PREFIX = `${API_BASE}/assets/`;

function assetPathFromSource(source: string): string {
  try {
    const url = new URL(source, window.location.href);
    const marker = '/main/data/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex >= 0) return url.pathname.slice(markerIndex + '/main/'.length).replace(/^\/+/, '');
    if (url.pathname.startsWith('/data/')) return url.pathname.replace(/^\/+/, '');
    if (url.pathname.startsWith('/api/assets/')) return '';
  } catch { /* fall through */ }
  return source.replace(/^\/+/, '').startsWith('data/') ? source.replace(/^\/+/, '') : '';
}

function assetUrl(path: string): string {
  return `${API_ASSET_PREFIX}${path.split('/').map(encodeURIComponent).join('/')}`;
}

function recoverImage(image: HTMLImageElement): void {
  if (image.dataset.assetFallback === 'true') return;
  const path = assetPathFromSource(image.currentSrc || image.src);
  if (!path) return;
  image.dataset.assetFallback = 'true';
  image.src = assetUrl(path);
}

window.addEventListener('error', (event) => {
  const target = event.target;
  if (target instanceof HTMLImageElement) recoverImage(target);
}, true);

export function resolveAssetUrl(source?: string): string {
  if (!source) return '';
  if (source.includes('/api/assets/')) return source;
  const path = assetPathFromSource(source);
  return path ? assetUrl(path) : source;
}
