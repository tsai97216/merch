# Merch TODO

## Current state

- **目前開發版本：`1.109.818`。**
- `RULES.md`：長期開發規則。
- `ITEM_SCHEMA.md`：Item 資料契約。
- `ITEM_TYPES.md`：Category registry。
- `PROJECT_ARCHITECTURE.md`：repository 與資料／部署責任邊界。
- `UI_ARCHITECTURE.md`：共用 UI 與 responsive baseline。
- 本文件只保留尚未完成的工作。

## Active work

- Deploy workflow 目前與 Verify workflow 平行執行，正式部署沒有以 Verify 成功作為 gate；需修正為只有對應 commit 的 Verify 成功後才能部署。

## Maintenance rule

- TODO 只追蹤「現在還沒完成什麼」。
- 已完成的一次性工作移除；長期規則放 `RULES.md`；資料契約放對應 schema / type 文件。
- 每完成一項工作立即移除對應 TODO。
