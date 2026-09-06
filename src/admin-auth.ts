import './admin-auth.css';
import { getAuthStatus, hasAdminSecret, setAdminSecret, clearAdminSecret } from './api';
import { showToast } from './utils/toast';

let mounted = false;

function renderStatus(root: HTMLElement, text: string, authenticated: boolean): void {
  const status = root.querySelector<HTMLElement>('[data-admin-auth-status]');
  if (!status) return;
  status.textContent = text;
  status.classList.toggle('is-authenticated', authenticated);
  status.classList.toggle('is-unauthenticated', !authenticated);
}

function mount(): void {
  if (mounted || !location.hash.startsWith('#/management')) return;
  const root = document.querySelector<HTMLElement>('#management-root');
  const panel = root?.closest<HTMLElement>('.management-panel');
  if (!root || !panel) return;

  const card = document.createElement('section');
  card.className = 'panel admin-auth-panel';
  card.innerHTML = '<div class="panel-heading"><div><span class="panel-label">ADMIN API</span><h2>管理驗證</h2></div><span data-admin-auth-status class="admin-auth-status is-unauthenticated">未驗證</span></div><div class="admin-auth-controls"><label class="field"><span>Admin Secret</span><input type="password" data-admin-secret autocomplete="off" spellcheck="false" placeholder="輸入管理驗證密鑰"></label><div class="admin-auth-actions"><button type="button" class="button" data-admin-auth-submit>驗證</button><button type="button" class="button secondary" data-admin-auth-clear>清除</button></div></div><p class="admin-auth-note">驗證資訊只保存在目前瀏覽器分頁的 sessionStorage，不會寫入收藏資料。</p>';
  panel.insertBefore(card, root);
  mounted = true;

  const input = card.querySelector<HTMLInputElement>('[data-admin-secret]');
  const submit = card.querySelector<HTMLButtonElement>('[data-admin-auth-submit]');
  const clear = card.querySelector<HTMLButtonElement>('[data-admin-auth-clear]');

  const check = async (): Promise<void> => {
    renderStatus(card, '驗證中…', false);
    try {
      const result = await getAuthStatus();
      renderStatus(card, result.authenticated ? '已驗證' : '未驗證', result.authenticated);
      if (!result.authenticated && hasAdminSecret()) clearAdminSecret();
    } catch (error) {
      renderStatus(card, '無法連線', false);
      showToast(error instanceof Error ? error.message : '無法取得驗證狀態。', 'error');
    }
  };

  submit?.addEventListener('click', async () => {
    const value = input?.value.trim() || '';
    if (!value) { showToast('請輸入 Admin Secret。', 'error'); return; }
    submit.disabled = true;
    try {
      setAdminSecret(value);
      await check();
      const status = card.querySelector<HTMLElement>('[data-admin-auth-status]');
      if (status?.classList.contains('is-authenticated')) {
        if (input) input.value = '';
        showToast('管理驗證成功。', 'success');
      } else {
        clearAdminSecret();
        showToast('Admin Secret 無效。', 'error');
      }
    } finally {
      submit.disabled = false;
    }
  });

  clear?.addEventListener('click', () => {
    clearAdminSecret();
    if (input) input.value = '';
    renderStatus(card, '未驗證', false);
    showToast('已清除本分頁的管理驗證。', 'info');
  });

  void check();
}

function scheduleMount(): void { window.setTimeout(mount, 0); }
window.addEventListener('hashchange', () => { mounted = false; scheduleMount(); });
window.addEventListener('DOMContentLoaded', scheduleMount);
scheduleMount();
