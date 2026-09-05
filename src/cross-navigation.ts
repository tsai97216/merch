const normalizeSearch = (value: string) => value.trim();

function goToCollectionSearch(query: string) {
  const normalized = normalizeSearch(query);
  location.hash = '#/collection';
  window.setTimeout(() => {
    const input = document.querySelector<HTMLInputElement>('#collection-search');
    if (!input) return;
    input.value = normalized;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }, 0);
}

function getSearchTarget(target: HTMLElement): HTMLElement | null {
  const explicit = target.closest<HTMLElement>('[data-search-query]');
  if (explicit) return explicit;

  const homeStat = target.closest<HTMLElement>('.page[data-page="home"] .stat-card');
  if (homeStat) return homeStat;

  const character = target.closest<HTMLElement>('#character-ranking li');
  if (character) return character.querySelector('strong');

  const workBar = target.closest<HTMLElement>('#work-bars .bar-row');
  if (workBar) return workBar.querySelector('span');

  const workStat = target.closest<HTMLElement>('#work-statistics .bar-row');
  if (workStat) return workStat.querySelector('span');

  const category = target.closest<HTMLElement>('#category-list > div');
  if (category) return category.querySelector('span');

  return null;
}

function getQueryForTarget(target: HTMLElement): string {
  const explicit = target.dataset.searchQuery;
  if (explicit != null) return explicit;
  if (target.matches('.stat-card')) {
    const label = target.querySelector('span')?.textContent?.trim() || '';
    if (label === '待到貨') return '待到貨';
    if (label === '已收到') return '已收到';
    if (label === '預購中') return '預購中';
    return '';
  }
  return target.textContent || '';
}

function installCrossNavigation() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const searchTarget = getSearchTarget(target);
    if (!searchTarget) return;

    const query = getQueryForTarget(searchTarget);
    event.preventDefault();
    event.stopPropagation();
    goToCollectionSearch(query);
  }, true);
}

installCrossNavigation();
