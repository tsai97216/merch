export type Route =
  | { name: 'home' }
  | { name: 'collection' }
  | { name: 'statistics' }
  | { name: 'management' }
  | { name: 'settings' }
  | { name: 'item'; id: string }
  | { name: 'not-found' };

export function parseRoute(hash = window.location.hash): Route {
  const raw = hash.replace(/^#\/?/, '');
  const [name, id] = raw.split('/');

  switch (name) {
    case 'collection': return { name: 'collection' };
    case 'statistics': return { name: 'statistics' };
    case 'management': return { name: 'management' };
    case 'settings': return { name: 'settings' };
    case 'item': return id ? { name: 'item', id: decodeURIComponent(id) } : { name: 'not-found' };
    case '':
    case 'home': return { name: 'home' };
    default: return { name: 'not-found' };
  }
}

export function navigate(route: Route): void {
  if (route.name === 'item') {
    window.location.hash = `#/item/${encodeURIComponent(route.id)}`;
    return;
  }
  window.location.hash = `#/${route.name}`;
}
