const API_BASE = ((import.meta as ImportMeta & { env?: { VITE_MERCH_API_URL?: string } }).env?.VITE_MERCH_API_URL || '/api').replace(/\/$/, '');
const API_ASSET_PREFIX = `${API_BASE}/assets/`;
const API_ASSET_FILE_PREFIX = `${API_BASE}/assets/by-file/`;
const LEGACY_ASSET_PREFIX = 'https://raw.githubusercontent.com/tsai97216/merch-old/main/';

function assetPathFromSource(source: string): string {
  try {
    const url = new URL(source, window.location.href);
    const marker = '/main/data/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex >= 0) return url.pathname.slice(markerIndex + '/main/'.length).replace(/^\/+/, '');
    if (url.pathname.startsWith('/data/')) return url.pathname.replace(/^\/+/, '');
    if (url.pathname.startsWith('/api/assets/')) {
      const assetMarker = '/api/assets/';
      const path = url.pathname.slice(url.pathname.indexOf(assetMarker) + assetMarker.length).replace(/^\/+/, '');
      return path.startsWith('by-file/') ? '' : path;
    }
  } catch { /* fall through */ }
  const normalized = source.replace(/^\/+/, '');
  return normalized.startsWith('data/') ? normalized : '';
}

function assetUrl(path: string): string {
  return `${API_ASSET_PREFIX}${path.split('/').map(encodeURIComponent).join('/')}`;
}

function assetFileUrl(file: string): string {
  return `${API_ASSET_FILE_PREFIX}${encodeURIComponent(file)}`;
}

function legacyAssetUrl(path: string): string {
  return `${LEGACY_ASSET_PREFIX}${path.split('/').map(encodeURIComponent).join('/')}`;
}

function recoverImage(image: HTMLImageElement): void {
  const source = image.currentSrc || image.src;
  const path = assetPathFromSource(source);
  if (!path) return;
  const stage = image.dataset.assetFallbackStage || '0';
  if (stage === '0') {
    image.dataset.assetFallbackStage = '1';
    image.src = assetUrl(path);
    return;
  }
  if (stage === '1') {
    image.dataset.assetFallbackStage = '2';
    image.src = legacyAssetUrl(path);
  }
}

window.addEventListener('error', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;
  const path = assetPathFromSource(target.currentSrc || target.src);
  if (!path) return;
  if ((target.dataset.assetFallbackStage || '0') === '2') return;
  event.stopImmediatePropagation();
  recoverImage(target);
}, true);

export function resolveAssetUrl(source?: string): string {
  if (!source) return '';
  if (source.includes('/api/assets/')) return source;
  const path = assetPathFromSource(source);
  return path ? assetUrl(path) : assetFileUrl(source.split('/').pop() || source);
}
