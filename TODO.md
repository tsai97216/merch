# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前正式版本：`1.109.272`。**
- `package.json` 與 `public/data/version.json` 已同步。
- 最新程式修改 commit：`38a3443960c8567f03414c3106580d571853d0e9`。
- API load / fallback contract 已補齊自動化驗證：static collection、獨立 shipping 載入、shipping-only failure、JSON／schema 異常與 Worker `/api/data` fallback 均有測試。
- Home 角色排行已改為依累計花費金額排序；多角色商品的金額按唯一角色平均分攤，並補上平手／競賽排名、排序與分攤契約驗證。
- Ranking detail rows 已統一為緊湊的「排名／名稱／金額」欄位結構，桌面與手機版都進一步縮短名稱與金額之間的距離。
- 其餘尚未完成的主要工作已收斂為：共用 UI 最終清理、部分頁面資訊層級確認，以及無法由現有 CI 覆蓋的實機驗收。

# P0｜共用 UI 與 Responsive 結構

## 1. Shared Field / Layout
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [ ] 持續確認共用 Input focus／outline、Modal / Surface、Toolbar / count 沒有重複實作。
- [ ] 不使用 page-specific CSS workaround 掩蓋 shared component 問題。

## 2. Responsive 結構
- [ ] 最終 Responsive 結構清理，持續以 shared foundation 為主。

# P1｜頁面結構與互動

## 3. Collection 控制列
- [ ] 重新確認狀態／類型／排序／顯示方式的資訊層級。
- [ ] 確認「全部、待到貨、預購中、已收到」filter 完整且與既有 state 一致。
- [ ] 移除 Collection intro 多餘說明。

## 4. Add 表單
- [ ] 確認所有 Add 控制項持續沿用 shared Field foundation，不建立 Add 專用尺寸或重複元件。

## 5. Management
- [ ] 管理表單整體結構與視覺跟 Add 一致，沿用 shared foundation。
- [ ] 上方搜尋 Toolbar 第一層結構，待實際驗收。
- [ ] 作品／類型／流水號／新增的 Desktop / Tablet 欄位配置，待實際驗收。
- [ ] 圖片管理區塊布局暫不處理，避免混入不同問題。

## 6. Shipping
- [ ] 重新確認表單與紀錄資訊層級及操作流程。

## 7. Home 角色排行
- [x] 改為依角色累計花費金額排序，免費周邊以 NT$0 計算。
- [x] 多角色商品的消費金額按唯一角色平均分攤，避免同一筆消費被重複計算。
- [x] 驗證相同花費顯示相同名次。
- [x] 驗證後續名次依競賽排名規則遞延。
- [x] 驗證排序與顯示邏輯一致。
- [x] 驗證角色排行與作品消費排行 Panel 內部結構。
- [x] 詳情排行表格名稱與金額欄距離調整為更緊湊排列。

# P2｜自動化驗證與資料完整性

## 8. Schema / Data / Statistics
- [ ] 新增／管理修改後 schema 與 validation contract 的完整覆蓋仍需持續確認。
- [ ] Work ID、Work Code、資料路徑與既有資料不衝突。
- [ ] 每月消費趨勢年度切換不污染明細資料。
- [ ] 圖表聚合、年月篩選、明細查詢使用一致年度邏輯。
- [x] 角色排行改以花費金額計算，並驗證平手、後續名次與多角色金額分攤規則。

# P3｜實機驗收

> 以下項目現有 CI／靜態檢查無法可靠覆蓋，必須在實際瀏覽器／實際裝置尺寸驗收。驗收完成後再移除對應 TODO。

## 11. Responsive 實機驗收
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

## 12. 實機功能驗收
- [ ] Item Detail Modal、Router 與 focus 狀態在實際瀏覽器操作下保持一致。
- [ ] 圖片新增、替換、刪除、主圖與排序的實際同步／錯誤／成功回饋。
- [ ] Shipping Item 選擇、搜尋、Filter、pagination、編輯／刪除／Detail 的實際操作流程。
- [ ] Collection 首次載入、Search、Filter、Sort、Detail、Add/Edit/Delete 與圖片操作的實際操作流程。
- [ ] Worker／Remote Data 相關流程在正式環境實際操作後，確認 UI 狀態與資料結果一致。

# P4｜Release
- [ ] TODO 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後再宣告 release。
