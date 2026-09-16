# UI Architecture / Current Baseline

> 本文件記錄目前 Merch 的共用 UI 架構與已確立的責任邊界。長期不可回歸規則以 `RULES.md` 為準；未完成工作只記錄於 `TODO.md`。

## Scope

目前正式頁面：

- Home
- Collection
- Statistics
- Add
- Shipping
- Management
- Settings
- Item Detail

共用 UI surface：

- Navigation / Header
- Button
- Input / Select / Segmented Control
- Card / Panel
- Badge
- Modal / Dialog
- Toast / Feedback
- Loading / Empty / Error
- Sync overlay

## Current architecture

### Design foundation

- Semantic design tokens 統一色彩、Typography、Spacing、Radius、Border、Surface、Focus、Shadow 等基礎。
- Light / Dark theme 由 shared theme foundation 管理。
- Responsive contract 集中於 `src/responsive-refinement.css`。
- Desktop、Tablet、Mobile 均視為正式 layout，而不是單純縮小 Desktop。

### Shared components

- 共用控制項與容器樣式集中於 `src/shared-components.css`、`src/controls.css`。
- Modal / Dialog、Feedback、Loading 與同步狀態使用既定 shared foundation。
- 舊相容 API 若仍存在，只負責轉送至 shared foundation，不建立第二套視覺實作。

### Page layer

- Page module 負責該頁資料整理、事件與 rendering。
- Page-specific CSS 只處理該頁真正獨有的布局與視覺，不重新定義 shared component。
- Viewport breakpoint 規則統一放在 `src/responsive-refinement.css`。

### State and interaction

- Store 是資料與 UI state 的主要來源。
- Remote mutation 透過 API 與 Store 的統一流程更新，不在頁面建立第二份遠端 state。
- API mutation 在完成前顯示明確的 blocking sync / upload 狀態。
- Loading、Empty、Error 三種狀態明確分離。
- Keyboard focus、focus-visible、disabled、reduced-motion 等狀態由共用基礎處理。

## Current file responsibilities

| Layer | Files | Responsibility |
|---|---|---|
| Tokens | `src/design-tokens.css` | Semantic design tokens |
| Theme | `src/theme.ts`, `src/theme.css`, `src/theme-refinement.css` | Theme initialization and theme-specific foundation |
| Shared UI | `src/shared-components.css`, `src/controls.css` | Shared controls, cards, panels, modal and feedback foundation |
| Responsive | `src/responsive-refinement.css` | Desktop / Tablet / Mobile viewport contract |
| Sync | `src/sync-overlay.ts`, `src/sync-overlay.css` | Blocking API synchronization feedback |
| Compatibility | `src/utils/toast.ts` | Legacy toast API forwarding to shared feedback |
| Page | `src/*.ts`, page CSS | Page-specific behavior and unique layout |

## Responsive baseline

### Desktop

- 使用完整 Navigation / Header 與內容最大寬度。
- 多欄資訊應保持清楚的資訊層級與可讀性。

### Tablet

- 允許 grid 欄位壓縮，但不得讓文字、金額或操作控制項溢出容器。
- 必要時使用省略、重新分配欄寬或重新排列資訊。

### Mobile

- Navigation 採品牌 Header + 可水平滑動的頁面導覽列。
- 不保留 Desktop sidebar 的佔位空間。
- 表單、Modal、排行榜、統計與管理資訊依可用空間重新安排。

## Verification baseline

UI 修改至少需要考慮：

- Light / Dark
- Desktop / Tablet / Mobile
- hover / focus-visible / disabled / loading
- Empty / Error
- reduced-motion
- Keyboard navigation
- Modal / Detail lifecycle
- Collection search / filter / sort 不回歸
- Add / Edit / Delete / Shipping 不回歸

## Maintenance rule

- 不新增與 shared foundation 重複的 page-specific 元件或 token。
- 發現舊實作與新 foundation 疊加時，先在 `TODO.md` 記錄，再移除或合併舊責任。
- 本文件只描述目前架構，不保留已完成 redesign 的舊 Phase checklist。
