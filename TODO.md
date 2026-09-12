# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前開發版本：`1.109.295`。**
- `package.json` 與 `public/data/version.json` 已同步。
- Shared Field／control foundation、Collection、Add、Management、Shipping 的主要資料／操作層級已完成程式檢視。
- API load / fallback contract、API mutation contract、Work identity contract、Statistics year / contract、Home ranking 等自動化驗證已完成。
- Mobile 與 Desktop 主要外觀驗收已完成。
- Tablet Responsive、Light / Dark shared controls、Item Detail / Router / focus、圖片操作、Shipping、Collection、Worker／Remote Data 等實機流程已完成前一版本驗收，未發現阻塞問題。

# 後續工作

## 1. API 同步狀態全頁阻塞動效
- [x] 建立共用滿版 API sync overlay，集中攔截遠端 mutation 請求。
- [x] PUT／PATCH 顯示編輯同步、POST 顯示新增同步、DELETE 顯示刪除同步；圖片與其他 API mutation 同樣涵蓋。
- [x] Overlay 覆蓋整個 viewport，明確阻止其他操作，並顯示持續中的 loading 動效。
- [x] API 請求成功或失敗後都會結束阻塞狀態；成功狀態仍由原本 API／Store 流程在真正完成後處理。
- [ ] 實機確認新增、編輯、刪除、圖片上傳／刪除在實際 API 延遲期間的滿版阻塞與動效表現。
- [ ] 驗證 TypeScript / build / API mutation contract，確認不影響既有 remote mutation 流程。

## 2. Management 圖片管理
- [ ] 圖片管理區塊布局暫不處理，避免混入其他問題；後續若重新調整，需依 `RULES.md` 的 shared foundation 原則處理。

## 3. Release
- [ ] `TODO.md` 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後正式宣告 release。

> API 同步全頁阻塞動效完成並實機驗收後再正式封版；在此之前不要宣告 `1.109.295` release。
