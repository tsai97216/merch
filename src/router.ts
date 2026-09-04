export type RouteName = 'home' | 'collection' | 'statistics' | 'management' | 'settings';
export type Route =
  | { name: RouteName }
  | { name: 'item'; id: string }
  | { name: 'not-found' };

type RouterOptions = { onNavigate: (route: Route) => void };

const staticRoutes = new Set<RouteName>(['home', 'collection', 'statistics', 'management', 'settings']);

function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return { name: 'home' };
  const parts = raw.split('/');
  if (parts.some((part) => part.length === 0)) return { name: 'not-found' };
  if (parts.length === 1 && staticRoutes.has(parts[0] as RouteName)) return { name: parts[0] as RouteName };
  if (parts.length === 2 && parts[0] === 'item') {
    try {
      const id = decodeURIComponent(parts[1]);
      return id ? { name: 'item', id } : { name: 'not-found' };
    } catch {
      return { name: 'not-found' };
    }
  }
  return { name: 'not-found' };
}

export function createRouter({ onNavigate }: RouterOptions) {
  const handleChange = () => onNavigate(parseHash(window.location.hash));
  return {
    start() { window.addEventListener('hashchange', handleChange); handleChange(); },
    stop() { window.removeEventListener('hashchange', handleChange); },
    navigate(path: string) { window.location.hash = path.replace(/^#/, '').replace(/^\//, ''); },
    current() { return parseHash(window.location.hash); },
  };
}
