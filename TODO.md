# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作不留在 TODO；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.95`。** `package.json` 與 `public/data/version.json` 必須保持同步。
- **目前主要工作：Collection 初始資料載入效能與正式網站實機驗收。**
- **Worker 修改必須採最小安全修改。** `worker/src/index.ts` 曾有不完整重寫造成回歸的風險，修改前必須取得可靠完整內容。
- **舊 `loadNewStaticData()` 暫不刪除。** 它仍是 `getRemoteData()` 失敗後的最後 fallback；需等新的資料載入與 fallback 路徑完成驗證後再清理。

## P0｜核心功能與正確性

1. **Collection 初始資料載入效能**
   - 正式網站目前優先讀取 build-time 產生的 `./data/collection.json`，Worker `/api/data` 作為 fallback / authoritative read path。
   - 待實際確認部署後首次載入速度，以及搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作時的等待時間。
   - 驗證完成後清理不再需要的舊逐 Item 靜態載入 fallback。
2. **Shipping `itemIds` 參照完整性最終實機驗收**：程式層修正與自動化 Verify 已完成；仍需確認被 Shipping 參照的 Item 無法被刪除，以及一般 Item 刪除流程正常。
3. **待新增作品：明日方舟：終末地（Arknights: Endfield）**：ID `arknights-endfield`、代號 `AKE`。尚未加入正式作品資料。

## P1｜UI / UX 與穩定性

1. 首頁角色排行文字顯示問題。
2. 新增表單、統計、運費、管理表單的版面與彈窗問題。
3. 收藏排序選擇器在暗色模式下的文字可讀性問題。
4. 收藏排序選擇器在白天模式下的框選顏色遮擋問題。
5. 暗色模式背景框圓角問題。
6. 設定頁跟隨系統深色模式。
7. 手機版統計／管理／設定頁持續改善。
8. 電腦版標題位置問題。
9. 完整檢查 Modal、Toast、Loading、Empty、Error、focus、overflow、z-index、responsive breakpoint 與 dead CSS / legacy selector。

## P2｜Motion

- 動畫與過渡效果暫不優先處理，待 P0 / P1 完成後再進行最後精修。

## P3｜Final acceptance

- 完成 P0 / P1 後進行手機版與電腦版完整流程驗收。
- 驗收收藏搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片管理、Shipping、統計、管理、設定與深色／淺色模式。
- 驗收部署後初始載入、Worker fallback 與 mutation 等待時間。
- 驗收完成後再進行最後 legacy / dead-code cleanup。
