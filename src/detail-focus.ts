let lastFocusedElement: HTMLElement | null = null;

function getDialog(): HTMLElement | null {
  const modal = document.querySelector<HTMLElement>('.item-detail-modal');
  if (!modal || modal.hidden) return null;
  return modal.querySelector<HTMLElement>('.item-detail-dialog');
}

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden && element.offsetParent !== null);
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
