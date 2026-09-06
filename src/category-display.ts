const CATEGORY_NAMES: Record<string, string> = {
  b: '徽章／吧唧',
  c: '卡片',
  d: '立牌／擺件',
  e: '電子產品',
  f: '手辦／模型',
  g: '文具',
  h: '海報／掛畫／掛軸',
  k: '掛件／吊飾',
  l: '文件／資料夾',
  m: '書籍／漫畫',
  n: '明信片',
  o: '其他',
  p: '毛絨／布偶',
  q: '鑰匙圈',
  r: '雷射票',
  s: '色紙',
  v: '服飾',
  w: '餐具／生活用品',
  y: '特典',
};

function categoryName(value: string): string {
  return CATEGORY_NAMES[value] ?? value;
}

function applyCategoryNames(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.item-card .item-top .muted, #detail-type').forEach((element) => {
    const value = element.textContent?.trim() ?? '';
    if (value) element.textContent = categoryName(value);
  });

  root.querySelectorAll<HTMLOptionElement>('#filter-category option').forEach((option) => {
    if (option.value !== 'all') option.textContent = categoryName(option.value);
  });

  root.querySelectorAll<SVGElement>('#statistics-charts text').forEach((element) => {
    const value = element.textContent?.trim() ?? '';
    if (value) element.textContent = categoryName(value);
  });
}

function start(): void {
  applyCategoryNames();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) applyCategoryNames(node as Element);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
