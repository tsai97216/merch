export type Route =
  | { name: 'home' }
  | { name: 'collection' }
  | { name: 'statistics' }
  | { name: 'management' }
  | { name: 'settings' }
  | { name: 'item'; id: string }
  | { name: 'not-found' };

const pageRoutes = new Set(['home', 'collection', 'statistics', 'management', 'settings']);

function decodeSegment(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    return decoded.length ? decoded : null;
  } catch {
    return null;
  }
}

export function parseRoute(hash = window.location.hash): Route {
  const normalized = hash.replace(/^#\/?/, '');
  const segments = normalized ? normalized.split('/') : [];
  const name = segments[0] ?? '';

  if (!segments.length) return { name: 'home' };
  if (pageRoutes.has(name) && segments.length === 1) return { name: name as 'home' | 'collection' | 'statistics' | 'management' | 'settings' };
  if (name === 'item' && segments.length === 2) {
    const id = decodeSegment(segments[1] ?? '');
    return id ? { name: 'item', id } : { name: 'not-found' };
  }
  return { name: 'not-found' };
}

export function navigate(route: Route): void {
  window.location.hash = route.name === 'item' ? `#/item/${encodeURIComponent(route.id)}` : `#/${route.name}`;
}

export function startRouter(onChange: (route: Route) => void): () => void {
  const handler = () => onChange(parseRoute());
  window.addEventListener('hashchange', handler);
  handler();
  return () => window.removeEventListener('hashchange', handler);
}
