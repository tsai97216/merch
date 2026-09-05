import './image-viewer.css';

let viewer: HTMLElement | null = null;
let returnFocus: HTMLElement | null = null;

function ensureViewer(): HTMLElement {
  if (viewer) return viewer;

  viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.hidden = true;
  viewer.innerHTML = `
    <div class="image-viewer-backdrop" data-image-viewer-close></div>
    <section class="image-viewer-dialog" role="dialog" aria-modal="true" aria-label="圖片檢視器">
      <button type="button" class="image-viewer-close" aria-label="關閉圖片檢視器" data-image-viewer-close>×</button>
      <img id="image-viewer-image" alt="" tabindex="0">
    </section>`;

  document.body.appendChild(viewer);
  viewer.querySelectorAll<HTMLElement>('[data-image-viewer-close]').forEach((node) => {
    node.addEventListener('click', closeViewer);
  });
  document.addEventListener('keydown', (event) => {
    if (!viewer || viewer.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [
      viewer.querySelector<HTMLButtonElement>('.image-viewer-close'),
      viewer.querySelector<HTMLImageElement>('#image-viewer-image'),
    ].filter((node): node is HTMLButtonElement | HTMLImageElement => Boolean(node) && !node.hidden);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  return viewer;
}

function openViewer(image: HTMLImageElement): void {
  const host = ensureViewer();
  const target = host.querySelector<HTMLImageElement>('#image-viewer-image');
  if (!target) return;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  target.src = image.currentSrc || image.src;
  target.alt = image.alt || '商品圖片';
  host.hidden = false;
  document.body.classList.add('image-viewer-open');
  host.querySelector<HTMLButtonElement>('.image-viewer-close')?.focus();
}

function closeViewer(): void {
  if (!viewer) return;
  viewer.hidden = true;
  document.body.classList.remove('image-viewer-open');
  returnFocus?.focus();
  returnFocus = null;
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const image = target?.closest<HTMLImageElement>('#item-detail-image img');
  if (!image || !image.complete || !image.naturalWidth) return;
  event.preventDefault();
  openViewer(image);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target as HTMLElement | null;
  const image = target?.closest<HTMLImageElement>('#item-detail-image img');
  if (!image || !image.complete || !image.naturalWidth) return;
  event.preventDefault();
  openViewer(image);
});
