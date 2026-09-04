export type Route =
  | { name: 'home' }
  | { name: 'collection' }
  | { name: 'statistics' }
  | { name: 'management' }
  | { name: 'settings' }
  | { name: 'item'; id: string }
  | { name: 'not-found' };

type RouterOptions = { onNavigate: (route: string) => void };

const staticRoutes = new Set(['home', 'collection', 'statistics', 'management', 'settings']);

function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw) return { name: 'home' };
  const parts = raw.split('/');
  if (parts.some((part) => part.length === 0)) return { name: 'not-found' };
  if (parts.length === 1 && staticRoutes.has(parts[0])) return { name: parts[0] as Exclude<Route, { name: 'item' } | { name: 'not-found' }>['name'] };
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
  const handleChange = () => {
    const route = parseHash(window.location.hash);
    onNavigate(route.name === 'item' ? '404' : route.name);
  };

  return {
    start() {
      window.addEventListener('hashchange', handleChange);
      handleChange();
    },
    stop() {
      window.removeEventListener('hashchange', handleChange);
    },
    navigate(path: string) {
      window.location.hash = path.replace(/^#/, '').replace(/^\//, '');
    },
    current() {
      return parseHash(window.location.hash);
    },
  };
}
