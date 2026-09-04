export type Route =
  | { name: 'home' }
  | { name: 'collection' }
  | { name: 'statistics' }
  | { name: 'management' }
  | { name: 'settings' }
  | { name: 'item'; id: string }
  | { name: 'not-found' };

const routes = new Set(['home', 'collection', 'statistics', 'management', 'settings']);

function decodeSegment(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    return decoded ? decoded : null;
  } catch {
    return null;
  }
}

export function parseRoute(hash = window.location.hash): Route {
  const raw = hash.replace(/^#\/?/, '');
  const segments = raw.split('/');
  const name = segments[0] ?? '';

  if (routes.has(name) && segments.length === 1) {
    return { name: name as Exclude<Route, { name: 'item' } | { name: 'not-found' }>['name'] };
  }

  if (name === 'item' && segments.length === 2) {
    const id = decodeSegment(segments[1] ?? '');
    return id ? { name: 'item', id } : { name: 'not-found' };
  }

  if (name === '' && segments.length === 1) return { name: 'home' };
  return { name: 'not-found' };
}

export function navigate(route: Route): void {
  if (route.name === 'item') {
    window.location.hash = `#/item/${encodeURIComponent(route.id)}`;
    return;
  }
  window.location.hash = `#/${route.name}`;
}
