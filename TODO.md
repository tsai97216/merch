# TODO

## Current state

- **目前已暫停大量資料輸入，先處理資料載入效能。** 使用者確認目前載入速度已實際影響透過網站新增 Item 與圖片上傳，因此本次可開始進行效能修正。
- **目前正式版本以 `public/data/version.json` 為準；修改前需同步 `package.json`。** 目前版本為 `1.109.96`。
- **資料輸入期間可正常新增、編輯、圖片管理與 Shipping。** Item 若仍被 Shipping `itemIds` 參照，Worker 會拒絕刪除。
- **1.109.95 的 GitHub Actions 已確認：Verify、Build、Deploy 全部成功。** Verify job 的所有驗證 steps 均成功，不再視為待確認。
- 若要修改 Worker，注意 `worker/src/index.ts` 曾有過被不完整重寫的回歸風險；不要根據截斷內容盲目整檔重寫，應先取得可靠完整內容或採安全的最小修改方式。
- **目前已完成三輪 Worker mutation 效能最佳化。** ① `loadRemoteForNewItem()` 已改為只讀 `baseRemote()` + 目標作品 category indexes，並在該作品範圍內確認 Item ID 不重複；② Work / Shipping mutation 已改為 commit 後直接套用 mutation snapshot 產生 response，避免再次完整 `loadRemote()`；③ Item mutation 現已改為 mutation-specific response，Frontend Store 直接套用單一 Item mutation，不再在 commit 後重新完整載入 Collection。
- **Worker 效能最佳化的安全邊界：** 不可拿被截斷的 `worker/src/index.ts` 回傳內容整檔重建；不可把 `public/data/collection.json` 當成 Worker mutation 的權威資料來源；不可用不可靠的 Worker isolate cache 取代 latest-head 驗證；atomic commit、latest-head、完整資料契約與安全驗證必須保留。
- **Item mutation response 效能瓶頸已完成修正。** Item PUT/DELETE 現在回傳 mutation-specific contract；Store 只更新受影響 Item、Work/category membership、flat `items` 與 version，保留既有 Shipping 狀態，不再觸發 post-commit 全量 Collection reload。
- **舊 `loadNewStaticData()` 暫不刪除。** 它仍是 `getRemoteData()` 失敗後的最後 fallback，只有在新的資料載入與 fallback 路徑充分驗證後，才能進行 cleanup。

## P0｜核心功能與正確性

1. **Shipping `itemIds` 參照完整性複查**：程式層修正已完成，且 1.109.95 Verify 已成功；最終仍需在實機驗收中確認使用者流程。
2. **Collection 初始資料載入效能**：目前已建立 build-time 單一靜態 Collection read model，Frontend `getRemoteData()` 優先讀取 `./data/collection.json`，Worker `/api/data` 保留為 fallback / mutation authoritative response。`sync-public-data.mjs` 與 `generate-collection.mjs` 已納入 build。仍需實際確認部署後初始載入、fallback、搜尋、Filter、Sort 與新增／圖片操作等待時間，並清理舊的逐 Item 靜態載入邏輯。
   - **Item mutation response 效能瓶頸：已完成。** API contract 已拆分為 read API 與 Item mutation API；Item mutation 不再要求完整 Collection response。
   - **新增 Item 前置讀取縮減：已完成。** 使用 `baseRemote()` + 目標作品 category indexes，避免預先載入所有作品 Item JSON；仍保留該作品範圍的 ID 重複檢查。
3. **Verify #862 發現的 Genshin `o/index.json` 缺失**：已補齊 `data/genshin-impact/o/index.json`，並同步版本至 `1.109.92`；後續完整 Verify 已通過，沒有因此保留未確認狀態。
4. **待新增作品：明日方舟：終末地（Arknights: Endfield）**：ID `arknights-endfield`、代號 `AKE`。目前僅記錄於 TODO，尚未加入正式作品資料。

## P1｜UI / UX 與穩定性

### Stage 8｜API / Worker / GitHub 寫入

1. **Shipping 參照刪除策略完成實作與驗證**：實作與自動化 Verify 已完成；Item 被 Shipping `itemIds` 參照時安全拒絕刪除，仍需在最終實機流程確認。

### Stage 9｜Verification / Build / Deployment

1. **1.109.95 Verify / Build / Deploy 已全部成功。**
2. **1.109.96 Item mutation response 優化的 Verify / Build / Deploy 待完成。**

## P2｜Motion

- 目前暫不優先處理動畫與過渡效果，待 P0/P1 完成後再處理。

## P3｜Final acceptance

- 完成 P0/P1 後進行手機版與電腦版完整流程驗收。
- 驗收收藏搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片管理、Shipping、統計、管理、設定與深色／淺色模式。
- 驗收部署後初始載入、Worker fallback 與 mutation 等待時間。
