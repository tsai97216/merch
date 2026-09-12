# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實機驗收。**

## Current state

- **目前正式版本：`1.109.290`。**
- `package.json` 與 `public/data/version.json` 已同步。
- 最新 CI 驗證：Verify #1784、Deploy #2387 均成功。
- API load / fallback contract 已補齊自動化驗證：static collection、獨立 shipping 載入、shipping-only failure、JSON／schema 異常與 Worker `/api/data` fallback 均有測試。
- API response 的 Item schema 已再加強 nested purchase / arrival / afterSales / image metadata、Item ID、Work ID 與 Shipping ID 的一致性檢查。
- API mutation contract 已新增自動化案例，覆蓋 Item PUT／DELETE、Shipping PUT、runtime workName 不寫入、nested schema 保留與 mutation version 驗證。
- Work identity contract 已新增自動化驗證，覆蓋現有 Work ID／Code／path 唯一性、path 派生規則、create/update 衝突檢查與已有 Item 時的 Code 保護。
- Home 角色資料的內部排序、平手／競賽排名、多角色金額分攤與排序契約已有驗證；UI 不再暴露排行語意。
- 首頁角色區塊維持 5 個角色的純文字卡片預覽，完整清單使用相同視覺語言。
- 作品消費排行維持獨立的金額排行資訊。
- 首頁「作品消費總排行」Desktop 明細已收緊作品名稱與金額的視覺距離，並限定在該 Home modal，不影響 Statistics。
- 角色區塊改版後的跨頁搜尋已使用目前 `.favorite-character-list` DOM 結構，未再依賴舊 `#character-ranking` selector。
- Shared Field／control foundation、Collection controls、Add／Management 共用表單結構與 Shipping 的資料／操作層級已完成程式檢視；剩餘重點轉為實際瀏覽器驗收。
- 每月消費趨勢的月明細已明確限制於所選年度，新增 `verify:statistics-year` 驗證跨年度明細隔離。
- 統計頁的年度選擇、12 個月聚合、年度摘要與月明細查詢已建立一致年度 contract，新增 `verify:statistics-contract`。
- 手機版外觀驗收已完成：手機尺寸與各頁主要視覺布局已由實際裝置確認；手機功能操作仍未列為已驗收。
- **Desktop 電腦版外觀驗收已完成：側邊欄展開／收縮、Logo 與 toggle 不重疊，以及主要頁面 Desktop 外觀已確認。**

# P0｜共用 UI 與 Responsive 結構

## 1. Shared Field / Layout
- [x] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則；現行 Add／Management 使用 shared form foundation，控制項幾何集中於 `controls.css`。
- [x] 確認共用 Input focus／outline、Modal / Surface、Toolbar / count 沒有重複的 semantic control implementation。
- [x] 清理既有已知重複或失效的 shared UI 規則；角色舊 selector 已同步移除於跨頁互動路徑。
- [x] 不使用 page-specific CSS workaround 掩蓋 shared component 問題；目前 responsive 規則集中於 `responsive-refinement.css`。

## 2. Responsive 結構
- [x] 整理 `src/responsive-refinement.css` 的 viewport 規則，保持 responsive layer 為主要斷點入口。
- [x] 檢查目前已知的角色區塊舊 selector，並同步跨頁搜尋邏輯至目前 `.favorite-character-list` DOM 結構。
- [x] 檢查角色舊 selector／responsive 規則，確認目前 CSS 已沒有舊 `#character-ranking` 的 responsive 規則。
- [x] Desktop Sidebar 收縮時隱藏 toggle 的視覺內容，避免與品牌 Logo 重疊；保留原本 toggle 的可操作 hit area 與 keyboard focus。

# P1｜頁面結構與互動

## 3. Collection
- [x] 重新確認狀態／類型／排序／顯示方式的資訊層級；現行 controls 已統一包裝為帶標籤的 control group。
- [x] 確認「全部、待到貨、預購中、已收到」filter 完整且與既有 state 一致。
- [x] 確認 Collection 沒有額外 intro 說明佔用主要操作區高度。

## 4. Add
- [x] 確認所有 Add 控制項沿用 shared control／form foundation，不建立 Add 專用控制項尺寸或第二套 semantic 元件。

## 5. Management
- [x] 管理表單整體結構與 Add 一致，沿用 shared foundation。
- [x] 確認上方搜尋 Toolbar 的第一層 DOM 結構已拆成搜尋列與 picker grid，避免所有控制項擠在同一層。
- [x] 確認作品／類型／流水號／新增欄位已有 Desktop / Tablet / Mobile 的 responsive 結構規則。
- [ ] 圖片管理區塊布局暫不處理，避免混入不同問題。

# P2｜自動化驗證與資料完整性
## 7. Schema / Data
- [x] 補齊新增／管理修改後 schema 與 validation contract 的自動化覆蓋。
  - [x] API response boundary 已補齊 nested purchase / arrival / afterSales / image metadata、Item ID、Work ID、Shipping ID 驗證。
  - [x] API mutation contract 已補上 Item PUT／DELETE、Shipping PUT、runtime field stripping、canonical nested payload 與 mutation response version 驗證，並納入 `verify:api-mutation` release verification script。
- [x] 驗證 Work ID、Work Code、資料路徑與既有資料不衝突；`verify:work-identity` 已檢查 persisted Work 唯一性、path 派生規則與 Worker CRUD conflict guards。
- [x] 驗證每月消費趨勢年度切換不污染明細資料；`statistics-data.ts` 現在只建立所選年度的 monthly detail entries，`verify:statistics-year` 覆蓋跨年度隔離與 selected-year month lookup。
- [x] 驗證圖表聚合、年月篩選、明細查詢使用一致年度邏輯；`verify:statistics-contract` 覆蓋 Store 年度選擇、`aggregateStatistics(..., selectedYear)`、12 個月 key、年度摘要與 detail lookup 的同年度來源。

# P3｜實機驗收
> 手機與 Desktop 外觀驗收已完成。以下只保留尚未完成的 Tablet 外觀與實際功能／正式環境驗收。
## 8. Responsive 實機驗收
- [x] 手機 360 / 390 / 430px Responsive 外觀。
- [x] 手機版 Home / Collection / Statistics / Add / Management / Shipping / Settings 七頁外觀。
- [x] 手機卡片必要時由 4 欄降為 2 欄，確認卡片寬度、文字可讀性與操作空間。
- [x] Mobile landscape：橫向滾動、按鈕切割、文字重疊、Modal overflow 的外觀檢查。
- [x] 手機 Header / Mobile Navigation / 主內容 frame spacing。
- [x] Desktop 電腦版主要外觀、側邊欄展開／收縮與品牌區域。
- [ ] 768 / 820 / 1024px Tablet Responsive contract。
- [ ] iPad / Tablet 各頁控制列、表單、卡片寬度與換行。
- [x] Collection 手機：狀態／類型／排序／顯示方式的資訊層級與 Mobile 佈局。
- [x] Add 手機：日期、文字、Select 控制項的實際高度、寬度、對齊與換行。
- [x] Management 手機：搜尋、結果數量、選擇器寬度、間距、換行與內容溢出；新增／編輯與現有作品排列。
- [x] Shipping 手機：表單、紀錄與 Detail 的資訊層級及操作流程外觀。
- [ ] Light / Dark mode 下 shared controls、focus、surface、border、radius 的完整跨裝置驗收。
## 9. 實機功能驗收
- [ ] Item Detail Modal、Router 與 focus 狀態在實際瀏覽器操作下保持一致。
- [ ] 圖片新增、替換、刪除、主圖與排序的實際同步／錯誤／成功回饋。
- [ ] Shipping Item 選擇、搜尋、Filter、pagination、編輯／刪除／Detail 的實際操作流程。
- [ ] Collection 首次載入、Search、Filter、Sort、Detail、Add/Edit/Delete 與圖片操作的實際操作流程。
- [ ] Worker／Remote Data 相關流程在正式環境實際操作後，確認 UI 狀態與資料結果一致。
# P4｜Release
- [ ] TODO 更新後重新確認 TypeScript / build / schema / data / Worker 相關驗證全部通過。
- [ ] GitHub Actions 成功後再宣告 release。
