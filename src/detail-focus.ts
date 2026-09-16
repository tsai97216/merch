let lastFocusedElement: HTMLElement | null = null;

function getDialog(): HTMLElement | null {
  const modal = document.querySelector<HTMLElement>('.item-detail-modal .item-detail-dialog[data-detail-item-id]');
  if (!modal || modal.closest<HTMLElement>('.item-detail-modal')?.hidden) return null;
  return modal;
}

function getStatisticsDialog(): HTMLElement | null {
  const dialogs = [...document.querySelectorAll<HTMLElement>('.statistics-detail-dialog')];
  return dialogs.at(-1) ?? null;
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

function rememberTrigger(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest<HTMLElement>('.item-card, [data-chart-open], .statistics-detail-row-clickable, .statistics-work-detail-row');
  if (trigger) lastFocusedElement = trigger;
}

function trapFocus(dialog: HTMLElement, event: KeyboardEvent): void {
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

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const dialog = getDialog();
  if (dialog) {
    trapFocus(dialog, event);
    return;
  }
  const statisticsDialog = getStatisticsDialog();
  if (statisticsDialog) trapFocus(statisticsDialog, event);
}

function syncFocus(): void {
  const dialog = getDialog();
  if (dialog) {
    const close = dialog.querySelector<HTMLElement>('.item-detail-close');
    (close || dialog).focus();
    return;
  }

  const statisticsDialog = getStatisticsDialog();
  if (statisticsDialog) {
    const close = statisticsDialog.querySelector<HTMLElement>('.statistics-detail-close');
    (close || statisticsDialog).focus();
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
