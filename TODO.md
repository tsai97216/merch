# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前開發版本：`1.109.340`。**
- `package.json` 與 `public/data/version.json` 已同步。
- `PROJECT_ARCHITECTURE.md` 已建立，作為目前 repository 檔案責任與後續架構清理的 inventory。
- Shared Field／control foundation、Collection、Add、Management、Shipping 的主要資料／操作層級已完成程式檢視。
- API load / fallback contract、API mutation contract、Work identity contract、Statistics year / contract、Home ranking 等自動化驗證已完成前一版本驗收。
- Mobile 與 Desktop 主要外觀驗收已完成。
- Tablet Responsive、Light / Dark shared controls、Item Detail / Router / focus、圖片操作、Shipping、Collection、Worker／Remote Data 等實機流程已完成前一版本驗收，未發現阻塞問題。

# 後續工作

## 1. API 同步狀態全頁阻塞動效
- [x] 建立共用滿版 API sync overlay，集中攔截遠端 mutation 請求。
- [x] PUT／PATCH 顯示編輯同步、POST 顯示新增同步、DELETE 顯示刪除同步；圖片與其他 API mutation 同樣涵蓋。
- [x] Overlay 覆蓋整個 viewport，明確阻止其他操作，並顯示持續中的 loading 動效。
- [x] API 請求成功或失敗後都會結束阻塞狀態；成功狀態仍由原本 API／Store 流程在真正完成後處理。
- [x] 修正 sync overlay 與 API 驗證腳本的環境邊界：error module 在非瀏覽器驗證環境不載入瀏覽器 overlay。
- [x] 成功完成回饋改為中央大型 feedback，與同步中的滿版動效維持同一級別的視覺回饋，不再使用左下角小型 Toast。
- [x] 統一同步中、成功、失敗、一般資訊等回饋動效的尺寸、位置、進出場動畫與視覺層級，避免同一套 API 流程出現不同形式的 feedback。
- [x] 移除 Management 編輯流程中與滿版 sync overlay 重複的「收藏修改同步中，請稍候」資訊 Toast，避免同步動畫與文字重疊。
- [x] 所有既有 `showToast()` 使用改由共用 animated feedback foundation 呈現，視覺上不再建立獨立 Toast 層。
- [ ] 實機確認新增、編輯、刪除、圖片上傳／刪除在實際 API 延遲期間的滿版阻塞、動效，以及完成後中央大型回饋表現。
- [ ] 驗證 TypeScript / build / API mutation contract，確認不影響既有 remote mutation 流程。

## 2. 目前 UI 問題：Management / Add 共用控制項
- [x] 移除 Management 頁面多餘的 `{類型}` 顯示：移除未被管理資料流使用的重複 `management-category` 欄位，保留上方 Work／Category／Serial selector 作為唯一類型來源。
- [x] 提高 Add 與 Management 的 Select 共用控制項高度至 46px，並移除固定 42px + 1.2 line-height 的 native select 組合，改用較寬鬆的共用 line box，避免文字下緣被裁切。
- [x] 實作 Item Detail 售後「狀態」欄位樣式與一般欄位標籤一致，避免誤用 section title 的視覺樣式。
- [x] Item Detail 的「商品描述／備註」內容改為一般正文尺寸與文字顏色，不再使用淺色小字。
- [ ] 實機確認 Management / Add 的 Select 在不同瀏覽器與響應式尺寸下文字不再裁切。
- [ ] 實機確認 Item Detail 的售後欄位與描述／備註文字層級符合設計。

## 3. Management 圖片管理
- [ ] 圖片管理區塊布局暫不處理，避免混入其他問題；後續若重新調整，需依 `RULES.md` 的 shared foundation 原則處理。

## 4. Logo / 品牌資產
- [x] Desktop 側邊欄使用共用 Logo：Light → `public/logo/icon-b.png`、Dark → `public/logo/icon-w.png`，並移除原本黑色方形背景與 `CM` brand mark。
- [x] Mobile 導覽列與 Desktop 共用同一套 Logo 資產與 Light / Dark 規則。
- [x] 淺色模式使用 `icon-b.png`。
- [x] 深色模式使用 `icon-w.png`。
- [x] Favicon 使用 `public/icons/favicon.png`，來源為 `icon-w.png`。
- [x] PWA／網站安裝圖示使用 `public/icons/pwa-icon.png`，來源為 `icon-w.png`。
- [x] 移除 `upload/icon-b.png`、`upload/icon-w.png`，品牌資產正式移入部署用 `public` 路徑。
- [ ] 實機確認 Desktop／Tablet／Mobile Logo 尺寸、主題切換與裁切表現。
- [ ] 實機確認 Favicon 與 PWA／網站安裝圖示。

## 5. 架構清理：疊加式實作盤點

### 5.1 已完成首輪盤點
- [x] 依 `PROJECT_ARCHITECTURE.md` 建立逐檔盤點範圍，先處理 foundation 與 enhancement 的責任邊界。
- [x] `styles.css`：確認 `main.ts` 先載入 `styles.css`，再由 `design-tokens.css` 間接載入 `controls.css`／`shared-components.css`；`.panel`、`.badge`、`.view-switch`、`.button`、`select` 等存在明確 shared foundation 重複實作，後續需徹底移除舊定義。
- [x] `controls.css`：確認為 Button、Input、Select、Textarea、Checkbox／Radio 等共用控制項的 canonical foundation，後續 page-specific 重複控制項應以此為準。
- [x] `responsive-refinement.css`：確認主要責任為 Desktop／Tablet／Mobile viewport contract；多數規則屬真正 responsive 行為，不應整檔刪除。
- [x] `theme-refinement.css`：確認包含 Settings、Add、Management、Statistics、Detail、Dark mode 等 theme refinement；不能因 selector 重名就整批刪除，需逐 selector 判斷是否為 theme-only 責任。
- [x] `card-enhancements.css`：確認卡片 meta row、item top、list mode 等仍有 card-specific layout 責任；但 `.item-card ... .badge` 對 Badge 的高度／padding／line-height 等定義與 shared Badge foundation 重疊，列入後續清理。
- [x] `toast.css`／`sync-overlay.*`：確認 `showToast()` 已經只轉送至 shared animated feedback foundation，但 `src/management.ts` 仍直接 import `./toast.css`，因此 legacy `toast.css` 仍會被載入；視覺層已替換，CSS／import 尚未完全清除。

### 5.2 下一輪清理順序
- [x] 清除 `src/management.ts` 等仍存在的 `toast.css` import，確認所有 `.toast` legacy selector 均無 runtime 依賴後移除 `src/toast.css`。
- [ ] 清理 `card-enhancements.css` 中與 shared Badge foundation 重複的 `.badge` 幾何／視覺定義，只保留真正屬於 Card layout 的規則。
- [ ] 逐項清理 `styles.css` 中已確認由 shared foundation 接管的 `.panel`、`.badge`、`.view-switch`、`.button`、`select` 舊定義，再檢查其餘 page layout / card / detail 規則的唯一責任。
- [ ] 逐項檢查 `theme.css`／`theme-refinement.css`，只移除確定重複的 theme implementation，保留必要的 theme-only refinement。
- [ ] 檢查 `responsive-refinement.css` 與各 page CSS 的 viewport 規則，將 responsive contract 留在 centralized responsive layer。
- [ ] 檢查 `home-enhancements.ts` 與 `main.ts` 的 Home rendering／互動責任是否重疊。
- [ ] 檢查 `management-images.css` 與 Management image rendering 是否存在重複責任。
- [ ] 檢查 `item-detail-modal.css` 與 shared Modal／Panel foundation 是否存在可移除的第二套實作。
- [ ] 每發現確定的舊實作、重複 selector、旁路 rendering 或 patch，先在 TODO 記錄具體問題，再徹底替換／移除，不以再加一層覆蓋處理。
- [ ] 清理完成後重新確認 import、selector、rendering、responsive、theme 的單一責任邊界。

## 6. Release
- [ ] `TODO.md` 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後正式宣告 release。

> API 同步全頁阻塞動效完成並實機驗收後再正式封版；在此之前不要宣告正式 release。
