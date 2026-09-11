# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前正式版本：`1.109.265`。**
- `package.json` 與 `public/data/version.json` 已同步。
- 最新修改 commit：`a132655029fe16bce8e75dce1dab0af7cfd4da2b`。
- Works Management Mobile 已確認正常：「新增／編輯作品」與「現有作品」已改為上下單欄，不再互相擠壓。
- Shipping records 已加入分頁，Item 選擇器與 Shipping records 都會依目前資料量自動限制頁碼。
- Shipping 分頁、Item 搜尋／Filter、編輯／刪除與 Detail 都使用同一份 Store snapshot；目前未發現 state 污染或 stale record 問題。
- 最新修改尚無可宣稱「CI 已通過」的 workflow run，發布前需重新確認。

# P0｜共用 UI 與 Responsive

## 1. Shared Field / Layout 最後收斂
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [x] 日期、文字、Select 等共用控制項高度、寬度與對齊統一。
- [ ] 持續確認共用 Input focus／outline、Modal / Surface、Toolbar / count 沒有重複實作。
- [x] Collection Select / View Button 的 semantic state 已移到 shared foundation。
- [x] Responsive layer 舊 Flex-only 宣告已清理。
- [ ] 不使用 page-specific CSS workaround 掩蓋 shared component 問題。

## 2. Responsive 結構
- [ ] 最終 Responsive 結構清理，持續以 shared foundation 為主。
- [x] Works Management viewport CSS 已集中，Mobile 單欄已確認。
- [x] Statistics viewport CSS 已集中，舊 `statistics-mobile.css` 已移除。
- [x] Settings auth viewport CSS 已集中。
- [x] Mobile Navigation 已改為可橫向捲動。
- [x] Mobile 701–820px main frame full-width 已修正。
- [x] Mobile Navigation <=820px frame spacing 已統一。
- [x] `src/styles.css` 殘留 mobile viewport rules 已清理。
- [x] Home「作品消費排行」Mobile spacing 已修正。

# P1｜頁面控制與結構

## 9. Collection 控制列
- [ ] 重新確認狀態／類型／排序／顯示方式的資訊層級。
- [ ] 確認「全部、待到貨、預購中、已收到」filter 完整且與既有 state 一致。
- [ ] 移除 Collection intro 多餘說明。

## 10. Add 表單
- [ ] 沿用 shared Field foundation，不建立 Add 專用控制項尺寸。

## 11. Management
- [ ] 管理表單整體結構與視覺跟 Add 一致，沿用 shared foundation。
- [ ] 上方搜尋 Toolbar 第一層結構，待 CI 驗收。
- [ ] 作品／類型／流水號／新增的 Desktop / Tablet 欄位配置，待 CI 驗收。
- [ ] 圖片管理區塊布局暫不處理，避免混入不同問題。

## 12. Shipping
- [ ] 重新確認表單與紀錄資訊層級及操作流程。
- [x] Item 大量資料選擇已具備搜尋與「只顯示已選」Filter，並與 Item pagination 分離；目前沒有明確需要額外分組層的問題。
- [x] Shipping records 已加入分頁，頁碼會依實際資料量限制，且刪除／資料更新後會自動校正目前頁碼。
- [x] 分頁、搜尋／篩選與詳細資訊保持資料一致；目前 state、record lookup 與 Detail 均以 Store snapshot 為單一資料來源。

## 14. Home 角色排行
- [ ] 相同數量顯示相同名次。
- [ ] 後續名次依競賽排名規則遞延。
- [ ] 驗證排序與顯示邏輯一致。
- [ ] 驗證角色排行與作品消費排行 Panel 內部結構。

# P2｜自動化最終驗收與發布

## 16. Schema / Data / Statistics
- [ ] 新增／管理修改後 schema 與 validation contract。
- [ ] Work ID、Work Code、資料路徑與既有資料不衝突。
- [ ] 每月消費趨勢年度切換不污染明細資料。
- [ ] 圖表聚合、年月篩選、明細查詢使用一致年度邏輯。
- [ ] 角色排行平手與後續名次規則驗證。

## 17. Collection Load / Fallback
- [ ] 首次載入、Search、Filter、Sort、Detail、Add/Edit/Delete、圖片操作契約。
- [ ] `collection.json` 與 Worker `/api/data` fallback。
- [ ] Remote Data 失敗時 Static Store 仍獨立載入 `shipping.json`。
- [ ] 適用 build／CI 通過後結案。

## 18. Shipping itemIds integrity
- [ ] 被 Shipping 參照的 Item 不可直接刪除，錯誤回饋契約正常。
- [ ] 移除 Shipping 關聯後 Item 刪除不破壞其他 Shipping records。

## 19. Functional Regression
- [ ] 全站核心流程回歸：載入、搜尋、篩選、排序、Detail、Add/Edit/Delete、圖片同步、Shipping。
- [ ] Worker mutation / transaction / write scope 驗證。

## 20. Release
- [ ] TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後再宣告 release。

# P3｜實機驗收

> 以下項目 CI／靜態檢查無法可靠覆蓋，必須在實際瀏覽器／實際裝置尺寸驗收。驗收完成後再移除對應 TODO。

## 21. Responsive 實機驗收
- [ ] 360 / 390 / 430 / 768 / 820 / 1024px Responsive contract。
- [ ] Home / Collection / Statistics / Add / Management / Shipping / Settings 七頁。
- [ ] 手機卡片必要時由 4 欄降為 2 欄，確認卡片寬度、文字可讀性與操作空間。
- [ ] Mobile landscape：橫向滾動、按鈕切割、文字重疊、Modal overflow。
- [ ] Header / Mobile Navigation / 主內容 frame spacing。
- [ ] iPad / Tablet 各頁控制列、表單、卡片寬度與換行。
- [ ] Collection：狀態／類型／排序／顯示方式的資訊層級、三列 Mobile 佈局，以及排序／顯示方式靠右且不互擠。
- [ ] Add：日期、文字、Select 控制項的實際高度、寬度、對齊與換行。
- [ ] Management：Desktop / Tablet / Mobile 搜尋、結果數量、選擇器寬度、間距、換行與內容溢出；新增／編輯與現有作品維持正確排列。
- [ ] Shipping：表單、紀錄與 Detail 的資訊層級及操作流程。
- [ ] Light / Dark mode 下 shared controls、focus、surface、border、radius 的實際顯示。

## 22. 實機功能驗收
- [ ] Item Detail Modal、Router 與 focus 狀態在實際瀏覽器操作下保持一致。
- [ ] 圖片新增、替換、刪除、主圖與排序的實際同步／錯誤／成功回饋。
- [ ] Shipping Item 選擇、搜尋、Filter、pagination、編輯／刪除／Detail 的實際操作流程。
- [ ] Collection 首次載入、Search、Filter、Sort、Detail、Add/Edit/Delete 與圖片操作的實際操作流程。
- [ ] Worker／Remote Data 相關流程在正式環境實際操作後，確認 UI 狀態與資料結果一致。
