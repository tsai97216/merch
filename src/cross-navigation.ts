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

function installCrossNavigation() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const clickable = target?.closest<HTMLElement>('[data-search-query]');
    if (!clickable) return;
    const query = clickable.dataset.searchQuery;
    if (!query) return;
    event.preventDefault();
    event.stopPropagation();
    goToCollectionSearch(query);
  }, true);
}

installCrossNavigation();
