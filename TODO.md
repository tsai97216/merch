# Merch TODO

## Current state

- **目前開發版本：`2.0.2`。**
- `RULES.md`：長期開發規則。
- `ITEM_SCHEMA.md`：Item 資料契約。
- `ITEM_TYPES.md`：Category registry。
- `PROJECT_ARCHITECTURE.md`：repository 與資料／部署責任邊界。
- `UI_ARCHITECTURE.md`：共用 UI 與 responsive baseline。
- 本文件只保留尚未完成的工作。

### PageSpeed / 效能改善

- [ ] **圖片傳輸最佳化**：目前 Item Card 會直接載入 R2 原始圖片；評估並實作適合列表縮圖的較小衍生圖片，Detail 再使用原圖。以 PageSpeed Mobile 約 566 KiB、Desktop 約 564 KiB 的圖片傳輸節省估算為主要改善目標。
- [ ] **Cache lifetime 最佳化**：檢查 GitHub Pages、Cloudflare／Worker、R2 各層的 cache headers，針對可長期快取的靜態 JS、CSS、圖片與資料設定合理快取策略。目前 PageSpeed 估算可改善約 176 KiB。
- [ ] **CSS 載入管線整理**：檢查 `index.html` 直接載入的 stylesheet 與 `main.ts` 內的 CSS imports，避免同時存在重複／分散的 CSS 載入路徑；評估統一交由 Vite bundle，降低 render-blocking requests。目前 PageSpeed 估算可減少約 200～230 ms。
- [ ] **CSS 使用量最佳化**：盤點目前 CSS，移除不再使用的規則與重複樣式；PageSpeed Diagnostics 顯示約 34 KiB unused CSS。
- [ ] **Desktop CLS 排查**：Desktop PageSpeed CLS 為 0.286，而 Mobile 為 0。需要取得並定位 PageSpeed 的「layout shift culprit」，確認是哪個 desktop 元素在載入／render／responsive layout 時位移，再從根因修正，不以固定高度等 workaround 掩蓋。
- [ ] **Accessibility / Agent Browsing 語意修正**：處理 PageSpeed Accessibility 92 所指出的 insufficient color contrast，以及「lists contain elements other than `li`」問題；同步確認 Agent Browsing accessibility tree malformed / Desktop 0/2、Mobile 1/2 是否因此改善。
- [ ] **Mobile 主執行緒負載優化**：在圖片與 CSS 問題處理後重新測量 Mobile TBT 480 ms、main-thread work 2.7 s 與 3 個 long tasks，再決定是否需要拆分 rendering、降低同步計算或調整動畫。Desktop TBT 目前為 0 ms，因此不預設進行大型 `main.ts` 重構。
- [ ] **Legacy JavaScript / Font display**：評估 PageSpeed 提出的約 11 KiB legacy JavaScript 與 Desktop 約 40 ms font display 問題，確認實際產物後再做必要的最小修改。
- [ ] **動畫與非 composited animation**：檢查 PageSpeed Diagnostics 的 2 個 Mobile／1 個 Desktop non-composited animations，確認是否為實際效能瓶頸後再調整。

## Maintenance rule

- TODO 只追蹤「現在還沒完成什麼」。
- 已完成的一次性工作移除；長期規則放 `RULES.md`；資料契約放對應 schema / type 文件。
- 每完成一項工作立即移除對應 TODO。
