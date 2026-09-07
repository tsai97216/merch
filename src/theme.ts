import './theme.css';
import './theme-refinement.css';

type Theme = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'merch-theme';

function getSystemTheme(): 'light' | 'dark' { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function getStoredTheme(): Theme { try { const value=localStorage.getItem(STORAGE_KEY); return value==='dark'||value==='light'?value:'system'; } catch { return 'system'; } }
function renderThemePanel(): void {
  const page=document.querySelector<HTMLElement>('[data-page="settings"]');
  const statusPanel=page?.querySelector('.settings-list')?.closest<HTMLElement>('.panel');
  if(!page||!statusPanel||page.querySelector('.settings-theme-panel'))return;
  const panel=document.createElement('section'); panel.className='panel settings-theme-panel'; panel.setAttribute('aria-labelledby','settings-theme-title');
  panel.innerHTML=`<div class="settings-theme-controls"><div><span class="panel-label">APPEARANCE</span><h2 id="settings-theme-title">顯示模式</h2><p class="settings-theme-copy">選擇網站外觀。跟隨系統會依照裝置的深色／淺色設定自動切換。</p></div><span data-theme-status class="muted">—</span></div><div class="theme-choice-group" role="group" aria-label="顯示模式"><button type="button" class="theme-choice" data-theme-choice="system" aria-pressed="false"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i><span>跟隨系統</span></button><button type="button" class="theme-choice" data-theme-choice="light" aria-pressed="false"><i class="fa-solid fa-sun" aria-hidden="true"></i><span>淺色模式</span></button><button type="button" class="theme-choice" data-theme-choice="dark" aria-pressed="false"><i class="fa-solid fa-moon" aria-hidden="true"></i><span>深色模式</span></button></div>`;
  statusPanel.insertAdjacentElement('afterend',panel);
}
function applyTheme(theme:Theme,persist=true):void{
  const effective=theme==='system'?getSystemTheme():theme; document.documentElement.dataset.theme=effective; document.documentElement.dataset.themePreference=theme; document.documentElement.style.colorScheme=effective;
  document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach(button=>{const active=button.dataset.themeChoice===theme;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  const status=document.querySelector<HTMLElement>('[data-theme-status]'); if(status)status.textContent=theme==='system'?`跟隨系統 · ${effective==='dark'?'深色':'淺色'}`:effective==='dark'?'深色模式':'淺色模式';
  if(persist){try{if(theme==='system')localStorage.removeItem(STORAGE_KEY);else localStorage.setItem(STORAGE_KEY,theme);}catch{/* storage may be unavailable */}}
}
function init():void{
  applyTheme(getStoredTheme(),false); renderThemePanel();
  document.addEventListener('click',event=>{const button=(event.target as Element|null)?.closest<HTMLButtonElement>('[data-theme-choice]');const theme=button?.dataset.themeChoice;if(theme==='system'||theme==='dark'||theme==='light')applyTheme(theme);});
  const media=window.matchMedia?.('(prefers-color-scheme: dark)'); media?.addEventListener('change',()=>{if(getStoredTheme()==='system')applyTheme('system',false);});
  window.addEventListener('hashchange',()=>window.setTimeout(renderThemePanel,0));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
