# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前正式版本：`1.109.294`。**
- `package.json` 與 `public/data/version.json` 已同步。
- Shared Field／control foundation、Collection、Add、Management、Shipping 的主要資料／操作層級已完成程式檢視。
- API load / fallback contract、API mutation contract、Work identity contract、Statistics year / contract、Home ranking 等自動化驗證已完成。
- Mobile 與 Desktop 主要外觀驗收已完成。
- Tablet Responsive、Light / Dark shared controls、Item Detail / Router / focus、圖片操作、Shipping、Collection、Worker／Remote Data 等實機流程已完成目前版本驗收，未發現阻塞問題。

# 後續工作

## 1. Management 圖片管理
- [ ] 圖片管理區塊布局暫不處理，避免混入其他問題；後續若重新調整，需依 `RULES.md` 的 shared foundation 原則處理。

## 2. Release
- [ ] `TODO.md` 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後正式宣告 release。

> 本次版本的實機驗收已完成；除非發現實際 bug，否則不要為此版本再做無關的結構性修改。
