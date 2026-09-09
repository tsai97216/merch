export function setFormErrors(container: HTMLElement | null, errors: string[]): void {
  if (!container) return;
  container.replaceChildren();
  container.hidden = errors.length === 0;
  container.classList.toggle('is-error', errors.length > 0);
  if (!errors.length) return;

  const list = document.createElement('ul');
  for (const error of errors) {
    const item = document.createElement('li');
    item.textContent = error;
    list.appendChild(item);
  }
  container.appendChild(list);
}

export function clearFormErrors(container: HTMLElement | null): void {
  setFormErrors(container, []);
}
