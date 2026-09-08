# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作不留在 TODO；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.155`。** `package.json` 與 `public/data/version.json` 必須保持同步。
- **目前主要工作：七頁整站 UI 重新設計與共用 Design System 建立。**
- **開發方向：優先修正底層結構與共用元件，不以局部補丁掩蓋根本問題。**

## P0｜核心功能與資料正確性

1. **Collection 初始資料載入與 fallback 最終驗收**
   - 驗證正式網站首次載入、搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作的實際等待時間。
   - 確認 build-time `collection.json` 與 Worker `/api/data` fallback 行為符合預期。
   - 實機驗收完成後，再判斷是否可移除舊 `loadNewStaticData()` fallback。
2. **Shipping `itemIds` 參照完整性實機驗收**
   - 確認被 Shipping 參照的 Item 無法被刪除。
   - 確認一般 Item 刪除流程正常且不破壞其他 Shipping records。

## P1｜整站 UI Design System 與七頁同步重構

### 1. 全站 Design System

- **色彩 Token**：建立品牌色、背景、Surface、文字、Border、狀態與語意化色彩 Token。
  - [x] 已建立 `src/design-tokens.css`，以 `tsai97216/chi-brand` 的 Merch 色彩為品牌基準。
  - [x] `theme-refinement.css` 已完成 legacy theme token 遷移，改用 semantic token；已移除被 semantic token 吸收的重複 Dark override。
  - [x] `theme.css` 已移除未使用的 control-group / focus-ring 歷史 token 與重複 Dark selector，只保留 theme state 必要的 `color-scheme` 行為。
  - [x] `design-tokens.css` 已移除 `--accent / --ink / --muted / --line / --panel / --soft` legacy alias 定義。
  - [ ] `src/ui-refinement.css` 仍有 `--muted / --soft / --ink / --line` legacy alias 引用，需先全部遷移至 semantic token，再視為完整清除。
- **Typography**：統一字體、字級、字重、行高與標題層級。
  - [x] 已建立 `src/typography.css`，並由 shared design tokens 載入。
- **Spacing**：建立全站一致的間距尺度。
  - [x] 已建立 `--space-1`～`--space-12` shared spacing scale。
- **Radius / Border / Surface**：統一圓角、邊框、表面層級與陰影語意。
  - [x] 已建立 radius、border width、surface、focus ring 與 shadow tokens，並提供 Light / Dark semantic values。
- **共用元件**：Button、Input / Select、Segmented Control、Card / Panel、Modal、Badge、Feedback。
  - [x] Button / Input / Select shared control foundation 已建立於 `src/controls.css`，由 `src/design-tokens.css` 統一載入。
  - [x] Segmented Control / Card / Panel foundation 已建立於 `src/shared-components.css`。
  - [x] Modal / Badge / Feedback foundation 已建立於 `src/shared-components.css`，尚待逐步把既有 page-specific markup / CSS 遷移至 shared contract。
  - [x] Toast / Feedback 已開始遷移至 semantic tokens。
- Light / Dark 直接共用 semantic tokens，不再以大量頁面專用 override 疊加。

### 2. 全站 Page Layout

- 統一 Header、Page Heading、Section、Content Width、Grid、Toolbar 與操作區。
- 建立清楚的資訊層級與元件邊界，讓七頁共享同一套版面基礎。
- [x] 已建立 shared content / page spacing tokens，並開始將既有 Toolbar / Form layout 的固定間距收斂至 shared tokens；下一步仍需逐步移除 page-specific layout 規則。
- [x] Add / Management 的主要表單 Grid、Field label 與控制項尺寸已遷移至 shared form foundation；仍需繼續檢查其他頁面的重複 Field / layout 規則。
- [x] Works Management 的 form / row spacing、label、border 與 muted text 規則已收斂至 shared semantic tokens，並完成現有結構驗證。

### 3. 七頁同步重新設計

> **首頁／收藏／統計／新增／管理／運費／設定一起進行，不再一頁一頁補丁式修改。**

- **首頁**：重新整理資訊總覽與視覺層級。
- **收藏**：重新設計 View / Sort / Filter 控制列與內容呈現。
- **統計**：重新整理圖表與數據層級。
- **新增**：重新分組長表單、欄位層級與操作區。
- **管理**：重新整理搜尋、選擇器、Editor 與 CRUD 回饋。
- **運費**：重新整理紀錄、金額／日期／物流／關聯 Item 的資訊呈現。
- **設定**：重新整理分類、外觀設定、資料／系統資訊與操作入口。
- 七頁共用同一套 Page Header、Section、Field、Button、Badge、Modal、Feedback 等 UI 基礎。
- 保留既有資料模型、Store、API、Worker 契約，除非確認根因位於資料層才修改資料架構。

### 4. Responsive

- **Desktop / Tablet / Mobile 一次納入設計。**
- 手機版不只是 Desktop 縮小版，而是依螢幕空間重新安排資訊層級、控制項與操作方式。
- 同步驗證各 breakpoint 的 overflow、可讀性與觸控操作空間。
- [ ] 將 `ui-refinement.css` 的 viewport breakpoint 規則收斂至 `responsive-refinement.css`，建立單一 responsive contract。
- [ ] 清查並移除已確認 dead 的 responsive selector，尤其 `management-form-grid`、`management-search-field` 等疑似舊 markup selector，須先完成 mapping 再刪除。

### 5. Light / Dark

- Light / Dark 同時設計。
- 所有共用元件直接使用 semantic tokens，避免「Light 做一套、Dark 再覆蓋一套」。
- 驗證文字對比、Surface 層級、Active / Hover / Focus / Disabled 等狀態。

### 6. Phase 0 架構盤點結果

#### 已確認的 CSS / Theme layer

- `src/styles.css`：目前仍承擔全站基礎 layout、page layout、card、control、responsive 與部分元件樣式，是最大的 legacy/base layer。
- `src/theme.css`：目前只保留 theme state 必要行為；主要 semantic token 與 Dark surface/state 已收斂至 shared token / refinement layer。
- `src/ui-refinement.css`：共用 refinement layer，包含 typography、control、card、form、management、detail、responsive polish；內容已累積多輪修補規則。
- `src/responsive-refinement.css`：另一個 refinement layer，針對 Management、Settings、Collection 與 breakpoint 再次覆寫 layout。
- `src/theme-refinement.css`：已完成 legacy theme token 遷移，目前待後續進一步判斷哪些 selectors 已被 shared foundation 吸收。
- `src/layout-refinement.css`：目前由 Add 模組直接 import，代表部分全站 layout/refinement 規則仍由頁面模組帶入。
- 另有頁面／功能專用 CSS，例如 `add.css`、`collection.css`、`statistics.css`、`shipping.css`、`works-management.css`、`management-images.css`、`settings-auth.css`、`item-detail-modal.css`、`image-viewer.css`、`toast.css`、`card-enhancements.css` 等。

#### 已確認的架構衝突

1. **多層 refinement 疊加**：`styles.css`、`theme.css`、`theme-refinement.css`、`ui-refinement.css`、`responsive-refinement.css`、`layout-refinement.css` 同時存在，且部分由 `index.html` 或功能模組直接載入。這是目前「改一處、另一處又覆蓋」風險的主要來源，應在共用 foundation 建立後逐步收斂。
2. **Theme token 尚未單一化**：legacy alias 定義已清除，但 `ui-refinement.css` 尚存在舊 alias 消費者，且仍有多組語意相近的 theme/control token 與部分直接寫死的顏色值；後續應繼續收斂為唯一 semantic token vocabulary。
3. **全站基礎樣式與 refinement 混在同一 layer**：`styles.css` 同時包含 reset、layout、component 與 responsive 行為，導致 shared foundation 與 legacy page styling 邊界不清。
4. **部分 shared layout 由頁面模組載入**：例如 Add 直接 import `layout-refinement.css`。這使 shared layout contract 不完全由全站入口管理，後續應移回 shared foundation。
5. **Responsive 規則存在重複責任**：`styles.css`、`ui-refinement.css` 與 `responsive-refinement.css` 都有 breakpoint 規則，尤其 Management/Collection/Heading/Content 寬度存在多層調整，應合併為單一 responsive contract。
6. **Management state coupling 已修正**：原先 `responsive-refinement.css` 使用 `:has(#management-delete...)` 反推新增／編輯模式並透過 `::before` 注入標題，現已改為由 `management.ts` 明確輸出 `.is-creating` / `.is-editing` state class，CSS 不再依按鈕 disabled 狀態推導頁面模式。
7. **Legacy alias 定義與消費者不同步**：`design-tokens.css` 已移除 legacy aliases，但 `ui-refinement.css` 尚有 `var(--muted / --soft / --ink / --line)` 引用；此問題已記錄，必須在下一輪 CSS cleanup 前完成遷移。

#### Shared UI implementation mapping（目前）

- Navigation / Sidebar：`index.html` + `styles.css` + `theme.css`。
- Page Heading / Hero / Section：主要在 `styles.css`，再由 `ui-refinement.css` / responsive layer 補強。
- Card / Panel：主要在 `styles.css`，部分 card behavior 在 `ui-refinement.css` / `card-enhancements.css`。
- Button / Input / Select：`src/controls.css` 已建立 shared foundation，舊版 selector 尚待逐步遷移與收斂。
- Theme：`theme.ts` + `theme.css` + `theme-refinement.css` + `design-tokens.css`。
- Item Detail：`main.ts` / `item-detail-modal.css`，另有 `image-viewer.ts/css` 與 shipping detail modal。
- Toast / Feedback：`utils/toast` + `toast.css`。
- Management form/editor：`management.ts` / `works-management.ts` + `works-management.css` / `management-images.css` + refinement layers。

#### 保留／合併／退場方向

- **保留**：Store/API/Worker 契約、資料模型、既有可驗證的互動邏輯；`theme.ts` 的 theme state 行為。
- **合併**：所有 shared token、base layout、controls、Card/Panel、Feedback、responsive contract、Light/Dark semantic states。
- **退場候選**：`ui-refinement.css`、`responsive-refinement.css`、`theme-refinement.css`、`layout-refinement.css` 中已被新 shared foundation 吸收的規則；以及被確認為 dead/duplicate 的 selector。
- **暫不刪除**：任何尚未完成 mapping、仍承擔功能的 selector 或 page-specific CSS，直到遷移與驗證完成。

### 7. 開始前的架構盤點

- [x] Inventory global CSS and design tokens.
- [x] Inventory shared selectors/components.
- [x] Inventory page-specific duplicated styles.
- [x] Inventory legacy selectors and obsolete visual rules.
- [x] Map each shared UI surface to its current implementation.
- [x] Record conflicts before changing them.

### 8. 後續執行順序

1. 建立 shared semantic token foundation。
2. 建立 shared controls / Card / Panel / Feedback 基礎。
3. 建立唯一 responsive contract。
4. 逐步把七頁遷移到 shared foundation，但一次以整站視角驗證，不做單頁補丁。
5. 每完成一組遷移，再刪除已被吸收且確認 dead 的 refinement 規則。
6. 最後進行 Light/Dark、Desktop/Tablet/Mobile、keyboard/focus 與功能回歸驗證。

## P2｜Motion 與視覺精修
- 在 P0 / P1 完成並通過實機驗收後，再統一處理動畫、transition 與細節視覺節奏。

## P3｜Final acceptance
- 手機版與電腦版完整流程驗收。
- 驗收收藏搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片管理、Shipping、統計、管理、設定與 Light / Dark。
- 驗收部署後初始載入、Worker fallback 與 mutation 同步等待時間。
- 驗收完成後進行最後 legacy / dead-code cleanup。
