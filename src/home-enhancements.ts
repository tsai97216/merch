import { loadStore, type MerchStore } from './store';
import type { Item } from './types';

const money = (n: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(Number(n))}`;
const quantityOf = (item: Item) => Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
const itemValue = (item: Item) => Number(item.purchase?.price || 0) * quantityOf(item);
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\\\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\\"':'&quot;', "'":'&#39;' }[c] as string));

let storeRef: MerchStore | null = null;
let characterModal: HTMLElement | null = null;

function renderHomeSpending(store: MerchStore) {
  const host = document.querySelector<HTMLElement>('#work-bars');
  if (!host) return;
  const { items, works } = store.snapshot;
  const spendingByWork = new Map<string, number>();
  items.forEach((item) => spendingByWork.set(item.workName || '未分類', (spendingByWork.get(item.workName || '未分類') || 0) + itemValue(item)));
  const rows = works.map((work) => ({ name: work.name, spend: spendingByWork.get(work.name) || 0 }))
    .sort((a, b) => b.spend - a.spend || a.name.localeCompare(b.name, 'zh-Hant'));
  const max = rows.reduce((value, row) => Math.max(value, row.spend), 0);
  host.innerHTML = rows.length
    ? rows.map((row) => `<div class="bar-row" data-search-query="${escapeHtml(row.name)}"><span>${escapeHtml(row.name)}</span><div><i style="width:${max ? Math.max(4, row.spend / max * 100) : 4}%"></i></div><b>${escapeHtml(money(row.spend))}</b></div>`).join('')
    : '<div class="empty-state">目前沒有資料</div>';
}

function ensureCharacterModal() {
  if (characterModal) return characterModal;
  const modal = document.createElement('div');
  modal.className = 'item-detail-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="item-detail-backdrop" data-character-ranking-close></div><section class="item-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="character-ranking-title"><button type="button" class="item-detail-close" aria-label="關閉" data-character-ranking-close><i class="fa-solid fa-xmark"></i></button><div class="item-detail-heading"><span class="eyebrow">CHARACTER RANKING</span><h2 id="character-ranking-title">角色完整排行</h2><p>依收藏數量排序，顯示全部角色。</p></div><ol id="character-ranking-all" class="ranking"></ol></section>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-character-ranking-close]').forEach((node) => node.addEventListener('click', closeCharacterModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && characterModal && !characterModal.hidden) closeCharacterModal();
  });
  characterModal = modal;
  return modal;
}

function getCharacterRows(store: MerchStore) {
  const counts = new Map<string, number>();
  store.snapshot.items.forEach((item) => (item.characters || []).forEach((character) => counts.set(character, (counts.get(character) || 0) + quantityOf(item))));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'));
}

function openCharacterModal() {
  if (!storeRef) return;
  const modal = ensureCharacterModal();
  const list = modal.querySelector<HTMLOListElement>('#character-ranking-all');
  const rows = getCharacterRows(storeRef);
  if (list) list.innerHTML = rows.length
    ? rows.map(([character, count], index) => `<li><span>${index + 1}</span><strong>${escapeHtml(character)}</strong><b>${count}</b></li>`).join('')
    : '<li class="empty-state">目前沒有資料</li>';
  modal.hidden = false;
  document.body.classList.add('detail-modal-open');
}

function closeCharacterModal() {
  if (!characterModal) return;
  characterModal.hidden = true;
  document.body.classList.remove('detail-modal-open');
}

function renderCharacterPreview(store: MerchStore) {
  const rank = document.querySelector<HTMLElement>('#character-ranking');
  if (!rank) return;
  const top = getCharacterRows(store).slice(0, 5);
  rank.innerHTML = top.length
    ? top.map(([character, count], index) => `<li><span>${index + 1}</span><strong>${escapeHtml(character)}</strong><b>${count}</b></li>`).join('')
    : '<li class="empty-state">目前沒有資料</li>';
}

function install() {
  const rankingPanel = document.querySelector<HTMLElement>('.ranking-panel');
  if (rankingPanel) {
    rankingPanel.setAttribute('role', 'button');
    rankingPanel.setAttribute('tabindex', '0');
    rankingPanel.setAttribute('aria-label', '查看全部角色排行');
    rankingPanel.addEventListener('click', openCharacterModal);
    rankingPanel.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCharacterModal();
      }
    });
  }
}

loadStore().then((store) => {
  storeRef = store;
  const render = () => {
    renderHomeSpending(store);
    renderCharacterPreview(store);
  };
  render();
  store.subscribe(render);
  install();
}).catch(() => undefined);
