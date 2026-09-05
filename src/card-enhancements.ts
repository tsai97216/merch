function normalizeCard(card: Element): void {
  const top = card.querySelector<HTMLElement>('.item-top');
  if (top) {
    const category = top.querySelector<HTMLElement>('.muted');
    const status = top.querySelector<HTMLElement>('.badge');
    if (category && status) {
      top.append(category, status);
      top.classList.add('card-meta-row');
    }
  }

  const price = card.querySelector<HTMLElement>('.item-bottom strong');
  if (!price || price.dataset.quantityFormatted === 'true') return;

  const text = price.textContent?.trim() || '';
  const match = text.match(/^(NT\$\s*[\d,]+)\s*[×x]\s*(\d+)\s*=.*$/i);
  if (!match) return;

  price.textContent = '';
  const unit = document.createElement('span');
  unit.className = 'unit-price';
  unit.textContent = `單價 ${match[1]}`;
  const quantity = document.createElement('small');
  quantity.className = 'quantity-mark';
  quantity.textContent = ` ×${match[2]}`;
  price.append(unit, quantity);
  price.dataset.quantityFormatted = 'true';
}

function normalizeCards(root: ParentNode = document): void {
  root.querySelectorAll('.item-card').forEach(normalizeCard);
}

normalizeCards();
new MutationObserver(() => normalizeCards()).observe(document.body, { childList: true, subtree: true });
