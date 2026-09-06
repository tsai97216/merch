import './settings-auth.css';
import { clearAdminSecret, getAuthStatus, hasAdminSecret, setAdminSecret } from './api';

let panel: HTMLElement | null = null;

function message(text: string, kind: 'info' | 'success' | 'error' = 'info'): void {
  const node = panel?.querySelector<HTMLElement>('[data-auth-message]');
  if (!node) return;
  node.textContent = text;
  node.dataset.kind = kind;
}

function updateStatus(authenticated: boolean): void {
  const status = panel?.querySelector<HTMLElement>('[data-auth-status]');
  if (!status) return;
  status.textContent = authenticated ? '已驗證' : '未驗證';
  status.dataset.authenticated = String(authenticated);
}

async function verifyStored(input: HTMLInputElement): Promise<void> {
  try {
    const result = await getAuthStatus();
    if (result.authenticated) {
      updateStatus(true);
      message('目前工作階段的 Admin Secret 有效。', 'success');
      return;
    }
  } catch {
    // The management write will report API availability errors when needed.
  }
  clearAdminSecret();
  input.value = '';
  updateStatus(false);
}

async function verify(): Promise<void> {
  const input = panel?.querySelector<HTMLInputElement>('#settings-admin-secret');
  const button = panel?.querySelector<HTMLButtonElement>('[data-auth-verify]');
  const secret = input?.value.trim() ?? '';
  if (!secret) {
    message('請輸入 Admin Secret。', 'error');
    updateStatus(false);
    return;
  }
  if (button) button.disabled = true;
  try {
    setAdminSecret(secret);
    const result = await getAuthStatus();
    if (!result.authenticated) {
      clearAdminSecret();
      if (input) input.value = '';
      updateStatus(false);
      message('Admin Secret 無效。', 'error');
      return;
    }
    updateStatus(true);
    message('驗證成功，現在可以進行遠端收藏修改。', 'success');
  } catch (error) {
    clearAdminSecret();
    updateStatus(false);
    message(error instanceof Error ? error.message : '驗證失敗，請稍後再試。', 'error');
  } finally {
    if (button) button.disabled = false;
  }
}

function renderPanel(): void {
  const page = document.querySelector<HTMLElement>('[data-page="settings"]');
  const heading = page?.querySelector<HTMLElement>('.page-heading');
  if (!page || !heading) return;

  const existing = page.querySelector<HTMLElement>('.settings-auth-panel');
  if (existing) panel = existing;
  if (panel?.isConnected) return;

  panel = document.createElement('section');
  panel.className = 'panel settings-auth-panel';
  panel.setAttribute('aria-labelledby', 'settings-auth-title');
  panel.innerHTML = `<div class="settings-auth-heading"><div><span class="panel-label">ADMIN ACCESS</span><h2 id="settings-auth-title">管理驗證</h2><p>遠端收藏修改需要 Admin Secret。驗證資訊只會暫存在目前瀏覽器工作階段。</p></div><span class="settings-auth-status" data-auth-status>未驗證</span></div><div class="settings-auth-controls"><label class="field"><span>Admin Secret</span><input id="settings-admin-secret" type="password" autocomplete="current-password" spellcheck="false" placeholder="輸入管理驗證密鑰"></label><div class="settings-auth-buttons"><button type="button" class="button" data-auth-verify>驗證</button><button type="button" class="button secondary" data-auth-clear>清除</button></div></div><p class="settings-auth-message" data-auth-message role="status"></p>`;
  heading.insertAdjacentElement('afterend', panel);

  panel.querySelector<HTMLButtonElement>('[data-auth-verify]')?.addEventListener('click', () => { void verify(); });
  panel.querySelector<HTMLButtonElement>('[data-auth-clear]')?.addEventListener('click', () => {
    clearAdminSecret();
    updateStatus(false);
    const input = panel?.querySelector<HTMLInputElement>('#settings-admin-secret');
    if (input) input.value = '';
    message('已清除目前瀏覽器工作階段的驗證資訊。');
  });

  const input = panel.querySelector<HTMLInputElement>('#settings-admin-secret');
  if (input && hasAdminSecret()) void verifyStored(input);
  else updateStatus(false);
}

function syncRoute(): void {
  if (location.hash === '#/settings') renderPanel();
}

window.addEventListener('hashchange', () => window.setTimeout(syncRoute, 0));
window.addEventListener('DOMContentLoaded', syncRoute);
window.setTimeout(syncRoute, 0);
