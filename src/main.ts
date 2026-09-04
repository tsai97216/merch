import './styles.css';
import { createRouter, type Route } from './router';
import { loadVersion } from './version';

const pages = new Map(
  [...document.querySelectorAll<HTMLElement>('[data-page]')].map((element) => [element.dataset.page ?? '', element]),
);

function renderRoute(route: Route): void {
  const page = route.name === 'item' || route.name === 'not-found' ? '404' : route.name;
  for (const [id, element] of pages) {
    const active = id === page;
    element.hidden = !active;
    element.classList.toggle('is-active', active);
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-route]')) {
    const active = link.dataset.route === page;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

const router = createRouter({ onNavigate: renderRoute });
router.start();

loadVersion()
  .then((version) => {
    for (const element of document.querySelectorAll<HTMLElement>('[data-version]')) {
      element.textContent = `v${version}`;
    }
  })
  .catch(() => {
    // The static shell remains usable if version metadata cannot be loaded.
  });
