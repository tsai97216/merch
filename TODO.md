# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前開發版本：`1.109.335`。**
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

## 4. 架構清理：疊加式實作盤點
- [ ] 依 `PROJECT_ARCHITECTURE.md` 逐檔檢查舊實作、新 foundation 與 enhancement 是否重複負責同一 UI／功能。
- [ ] 優先檢查 `styles.css`、`theme*.css`、`controls.css`、`responsive-refinement.css`、`card-enhancements.css`、`toast.css`、`sync-overlay.*` 與各 page-specific CSS 的責任重疊。
- [ ] 發現確定的舊實作、重複 selector、旁路 rendering 或 patch 時，先記錄具體問題，再徹底替換／移除，不以再加一層覆蓋處理。
- [ ] 清理後重新確認 import、selector、rendering、responsive 與 theme 的單一責任邊界。

## 5. Release
- [ ] `TODO.md` 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後正式宣告 release。

> API 同步全頁阻塞動效完成並實機驗收後再正式封版；在此之前不要宣告正式 release。
