# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前正式版本：`1.109.295`。**
- `package.json` 與 `public/data/version.json` 應保持同步。
- Shared Field／control foundation、Collection、Add、Management、Shipping 的主要資料／操作層級已完成程式檢視。
- API load / fallback contract、API mutation contract、Work identity contract、Statistics year / contract、Home ranking 等自動化驗證已完成。
- Mobile 與 Desktop 主要外觀驗收已完成。
- Tablet Responsive、Light / Dark shared controls、Item Detail / Router / focus、圖片操作、Shipping、Collection、Worker／Remote Data 等實機流程已完成目前版本驗收，未發現阻塞問題。

# 後續工作

## 1. API 同步狀態全頁阻塞動效
- [ ] 新增共用的滿版 API sync overlay，所有會等待遠端同步完成的新增、編輯、刪除與圖片操作統一使用。
- [ ] Sync overlay 必須覆蓋整個 viewport，明確告知使用者目前正在同步且暫時不可操作；同步完成前不得顯示成功狀態。
- [ ] Overlay 應有穩定、可理解的 loading 動效，避免頁面局部 spinner 讓使用者誤以為其他操作仍可進行。
- [ ] 同步失敗時離開阻塞狀態並顯示可理解的錯誤回饋。
- [ ] 應以共用 Store／remote mutation 狀態處理，不在各頁面各自實作獨立 overlay。

## 2. Management 圖片管理
- [ ] 圖片管理區塊布局暫不處理，避免混入其他問題；後續若重新調整，需依 `RULES.md` 的 shared foundation 原則處理。

## 3. Release
- [ ] `TODO.md` 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後正式宣告 release。

> API 同步全頁阻塞動效完成並驗收後再正式封版；在此之前不要宣告 `1.109.295` release。
