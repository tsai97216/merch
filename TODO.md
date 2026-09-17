# Merch TODO

## Current state

- **目前開發版本：`1.109.823`。**
- `RULES.md`：長期開發規則。
- `ITEM_SCHEMA.md`：Item 資料契約。
- `ITEM_TYPES.md`：Category registry。
- `PROJECT_ARCHITECTURE.md`：repository 與資料／部署責任邊界。
- `UI_ARCHITECTURE.md`：共用 UI 與 responsive baseline。
- 本文件只保留尚未完成的工作。

## Active work

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

### 新增作品準備

- [ ] **建立完整的「新增作品」流程準備**：新增作品後，所有依 Work registry／作品資料產生或統計的功能都必須同步支援新作品，不只建立作品資料本身。目前既有程式已確認首頁、Collection、Statistics、Management、generated collection read model 均以 Work registry／Store 資料動態運作；剩餘工作是完成一次不改動正式資料的新增作品整合驗證。
  - [x] 盤點目前所有以固定作品清單、work code、works registry 或 hard-code series/category 對應的程式與資料；目前 Work identity 與主要頁面已改為 registry-driven，`verify:work-registry` 亦檢查主要入口。
  - [x] 確認首頁各作品統計、近期周邊、排行榜等資料會自動納入新作品；首頁作品統計使用 Store `works`，排行榜資料使用 Item／Work identity 動態聚合。
  - [x] 確認 Statistics 各圖表、明細、分類／作品統計會自動納入新作品並正確計算；Statistics 以 Item 的 `workName` 動態聚合，未硬編碼現有 Work code。
  - [x] 確認 Collection 的作品篩選、搜尋與數量統計會納入新作品；Collection 使用 Store Work registry 與 Item 集合。
  - [x] 確認 Management 的作品 selector、Item 新增／編輯流程可正確選擇新作品；Management 與 Add 均使用 Store `works`，並以永久 `work.id` 作為 state key。
  - [x] 確認 build 產生的 `public/data/` read models、index 與其他衍生資料會正確包含新作品；`generate-collection.mjs` 遍歷 `data/works.json` 的完整 registry。
  - [ ] 完整新增一個測試作品進行驗證，確認新增作品後各頁面與圖表均能正常顯示，且不需要額外手動補資料；測試必須使用隔離／可回復方式，不直接污染正式收藏資料。

## Maintenance rule

- TODO 只追蹤「現在還沒完成什麼」。
- 已完成的一次性工作移除；長期規則放 `RULES.md`；資料契約放對應 schema / type 文件。
- 每完成一項工作立即移除對應 TODO。
