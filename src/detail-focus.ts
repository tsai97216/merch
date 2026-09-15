let lastFocusedElement: HTMLElement | null = null;
const statisticsDialogCleanups = new WeakMap<HTMLElement, () => void>();

function getDialog(): HTMLElement | null {
  const modal = document.querySelector<HTMLElement>('.item-detail-modal .item-detail-dialog[data-detail-item-id]');
  if (!modal || modal.closest<HTMLElement>('.item-detail-modal')?.hidden) return null;
  return modal;
}

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden && element.offsetParent !== null);
}

export function setupDialogFocus(dialog: HTMLElement): () => void {
  const restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const elements = focusableElements(dialog);
    if (!elements.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeydown, true);
  const initial = dialog.querySelector<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  (initial || dialog).focus();
  return () => {
    document.removeEventListener('keydown', onKeydown, true);
    if (restoreTarget && document.contains(restoreTarget)) restoreTarget.focus();
  };
}

function observeStatisticsDialogs(): void {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        const dialogs: HTMLElement[] = [];
        if (node instanceof HTMLElement && node.matches('.statistics-detail-dialog')) dialogs.push(node);
        dialogs.push(...node.querySelectorAll<HTMLElement>('.statistics-detail-dialog'));
        dialogs.forEach((dialog) => {
          if (statisticsDialogCleanups.has(dialog)) return;
          statisticsDialogCleanups.set(dialog, setupDialogFocus(dialog));
        });
      });
      record.removedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        const dialogs: HTMLElement[] = [];
        if (node instanceof HTMLElement && node.matches('.statistics-detail-dialog')) dialogs.push(node);
        dialogs.push(...node.querySelectorAll<HTMLElement>('.statistics-detail-dialog'));
        dialogs.forEach((dialog) => {
          statisticsDialogCleanups.get(dialog)?.();
          statisticsDialogCleanups.delete(dialog);
        });
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function rememberTrigger(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const card = target.closest<HTMLElement>('.item-card');
  if (card) lastFocusedElement = card;
}

function handleKeydown(event: KeyboardEvent): void {
  const dialog = getDialog();
  if (!dialog || event.key !== 'Tab') return;

  const elements = focusableElements(dialog);
  if (!elements.length) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const first = elements[0];
  const last = elements[elements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function syncFocus(): void {
  const dialog = getDialog();
  if (dialog) {
    const close = dialog.querySelector<HTMLElement>('.item-detail-close');
    (close || dialog).focus();
    return;
  }

  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

document.addEventListener('click', rememberTrigger, true);
document.addEventListener('keydown', handleKeydown, true);
window.addEventListener('hashchange', () => window.setTimeout(syncFocus, 0));
window.addEventListener('DOMContentLoaded', observeStatisticsDialogs, { once: true });
if (document.readyState !== 'loading') observeStatisticsDialogs();
