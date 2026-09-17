# Merch TODO

## Current state

- **目前開發版本：`1.109.816`。**
- `RULES.md`：長期開發規則。
- `ITEM_SCHEMA.md`：Item 資料契約。
- `ITEM_TYPES.md`：Category registry。
- `PROJECT_ARCHITECTURE.md`：repository 與資料／部署責任邊界。
- `UI_ARCHITECTURE.md`：共用 UI 與 responsive baseline。
- 本文件只保留尚未完成的工作。

## Active work

### 1. 圖片上傳 API 邊界驗收
- [ ] 正式 Worker 部署 `1.109.816`，確認正式環境已使用最新 Worker。
- [ ] 驗收小圖、接近 8 MB 圖片、替換既有圖片三種情境。
- [x] 修正前端 8 MB 上限與 Worker Base64 邊界不一致：Worker 現在接受完整 8 MB 原始檔案對應的 Base64 長度上限 `11,184,812`。
- [ ] 驗證前端單檔 8 MB 上限、Base64 約 33% 膨脹，以及 Worker mutation 邊界行為。

### 2. 發布前正式環境驗收
- [ ] 完成上述圖片邊界案例的正式網站驗收。
- [ ] 若實際驗收發現新問題，先記錄根因與影響，再修正並重新驗證。

## Maintenance rule

- TODO 只追蹤「現在還沒完成什麼」。
- 已完成的一次性工作移除；長期規則放 `RULES.md`；資料契約放對應 schema / type 文件。
- 每完成一項工作立即移除對應 TODO。
