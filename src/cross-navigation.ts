const normalizeSearch = (value: string) => value.trim();

function goToCollectionSearch(query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return;

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

function hideReceivedBadges(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.item-card .badge').forEach((badge) => {
    if (badge.textContent?.trim() === '已收到') badge.remove();
  });
}

function installCrossNavigation() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const searchTarget = getSearchTarget(target);
    if (!searchTarget) return;

    const query = searchTarget.dataset.searchQuery || searchTarget.textContent || '';
    if (!normalizeSearch(query)) return;

    event.preventDefault();
    event.stopPropagation();
    goToCollectionSearch(query);
  }, true);

  hideReceivedBadges();
  const observer = new MutationObserver(() => hideReceivedBadges());
  observer.observe(document.body, { childList: true, subtree: true });
}

installCrossNavigation();
