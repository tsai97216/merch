# TODO

> This file tracks implementation status. Only completed items are checked.
> 
> 本次資料架構重整以 `v1.99.42` 為基準，先整理規格，再開始實作。未完成項目不得提前勾選。

## 0. Foundation
- [x] Project structure
- [x] TypeScript + Vite + ES Modules
- [x] GitHub Pages deployment
- [x] Formal domain
- [x] Work code / Item ID rules
- [x] Shared Store architecture
- [x] External data validation

## 1. Data Layer
- [x] Works index
- [x] Work data split
- [x] **重建 Item schema：以目前確定的基本／購買／到貨／售後／圖片欄位為唯一規格**
- [ ] **周邊資料改為「一個作品 × 一個類型一個 JSON」的儲存架構**（此項架構方向改由 §16 取代，實作時以 §16 為準）
- [ ] **建立類型 JSON 的路徑／命名規則與 index 對應規則**（此項架構方向改由 §16 取代）
- [ ] **Store 改為讀取並合併各類型 JSON，對 UI 維持單一 Item 集合**（此項架構方向改由 §16 取代）
- [ ] **Store 寫入時只更新受影響的類型 JSON，不再整份作品 JSON 覆寫**（此項架構方向改由 §16 取代）
- [x] Quantity normalization
- [x] Item ID validation
- [x] Duplicate Item ID validation
- [x] Duplicate permanent serial validation
- [x] Local UI state persistence
- [x] Shared Store instance
- [x] Remote data loading with static fallback

## 2. Data Migration
- [x] **完成舊作品 JSON → 新 Item 儲存架構的完整遷移**
- [x] **完成遷移前後 Item 數量、ID、圖片、購買、到貨、售後資料逐項比對**
- [x] **移除舊物流欄位與不再使用的欄位**
- [x] **處理 `亞克力` 為材質而非商品類型的既有資料**
- [x] **建立 migration / rollback 安全流程**
- [x] Legacy data normalization
- [x] Quantity migration
- [x] Image metadata migration

## 3. Version
- [x] version.json
- [x] package.json version sync with official version
- [x] UI version rendering
- [x] API write version bump
- [x] **資料架構重整完成後再次確認版本來源只有 `public/data/version.json`**

## 4. Router
- [x] Hash routes
- [x] Home
- [x] Collection
- [x] Statistics
- [x] Management
- [x] Settings
- [x] Item detail
- [x] Back / forward
- [x] Refresh safety
- [x] Malformed route safety
- [x] 404

## 5. UI System
- [x] 全站 layout
- [x] Modal
- [x] Toast
- [x] Button
- [x] Input
- [x] Card
- [x] Panel
- [x] Badge

## 6. Dashboard / Home
- [x] 待到貨（合併 `pending + preorder`）
- [x] 作品統計
- [x] 消費統計
- [x] 快速入口
- [x] 主頁狀態統計方塊點擊後導向 Collection，並帶入對應狀態搜尋條件
- [x] 主頁作品統計方塊／項目點擊後導向 Collection，並帶入對應作品搜尋條件
- [x] 主頁其他可對應收藏的統計項目提供搜尋轉跳
- [x] JS 失敗時仍能看到基本首頁
- [x] Home 資料區塊在空資料時仍保持合理排版
- [x] Home 數量統計依 quantity 加總
- [x] Home 消費統計依單價 × quantity 計算
- [x] 作品消費排行
- [x] 作品消費排行完整總排行 Modal
- [x] 角色排行 Top 5
- [x] 角色排行完整總排行 Modal

## 7. Collection
- [x] 全部
- [x] 作品分類
- [x] 搜尋
- [x] 搜尋支援狀態文字：`預購中`、`待到貨`、`已收到` 等使用者可見狀態
- [x] `待到貨` 搜尋結果包含 `pending + preorder`
- [x] `預購中` 搜尋仍可單獨命中 preorder
- [x] `已收到` 搜尋仍可單獨命中 received
- [x] 搜尋支援多個詞條同時搜尋，採 AND 邏輯
- [x] 多詞條支援空白、`,`、`，` 等常見分隔方式
- [x] 搜尋詞條與既有 Item ID／作品／類型／角色／廠商等搜尋邏輯保持相容
- [x] Filter
- [x] Sort
- [x] 狀態篩選
- [x] 類別篩選
- [x] 搜尋下方只保留「類型／狀態」可見篩選
- [x] 角色條件可透過搜尋
- [x] 廠商條件可透過搜尋
- [x] 排序改為按鈕式控制
- [x] 卡片顯示模式
- [x] 清單顯示模式
- [x] 記住卡片／清單選擇
- [x] 顯示封面
- [x] 顯示標題
- [x] 顯示作品
- [x] 顯示角色
- [x] 顯示類別
- [x] 顯示價格
- [x] 顯示數量
- [x] 顯示多件商品的單價 × 數量與合計價值
- [x] 顯示狀態
- [x] 顯示預計到貨日期
- [x] 點擊進入詳細頁
- [x] 篩選條件組合正確
- [x] 搜尋／篩選／排序狀態與 Store 同步
- [x] 無結果 Empty State
- [x] 圖片載入失敗 fallback
- [x] 卡片與清單在手機版保持可用

## 8. Item Detail
- [x] **依新 Item schema 重整完整基本資訊**
- [x] **依新 schema 重整購買資訊**
- [x] 顯示單價
- [x] 顯示數量
- [x] 顯示數量加權後合計價值
- [x] **依新 schema 重整到貨資訊**
- [x] **依新 schema 重整售後資訊**
- [x] 圖片展示
- [x] 圖片載入失敗 fallback
- [x] 編輯
- [x] 刪除
- [x] 返回
- [x] 不存在的 Item 顯示 Not Found
- [x] Modal / Detail 狀態與 Router 狀態一致
- [x] 鍵盤關閉與 focus 管理
- [x] 「已收到」狀態徽章隱藏文字並保留空間

## 9. Statistics
- [x] 按作品統計
- [x] 按類別統計
- [ ] 按角色統計（否決）
- [ ] 按廠商統計（否決）
- [ ] 按狀態統計（否決）
- [x] 總消費
- [x] 總數量統計依 quantity 加總
- [x] 作品數量統計依 quantity 加總
- [x] 類別數量統計依 quantity 加總
- [x] 各作品消費
- [x] 各月份消費（1～12 月完整顯示，無資料月份為 0）
- [x] 移除「每月新增收藏」統計
- [x] 集中使用 Date utility
- [x] 統計計算與 UI rendering 分離
- [x] 空資料狀態
- [x] 金額／數量格式統一
- [x] 消費：大圖長條圖／小圖圓餅圖
- [x] 每月：大圖長條圖／小圖長條圖
- [x] 收藏：大圖長條圖／小圖圓餅圖
- [x] 類別：大圖圓餅圖／小圖圓餅圖
- [x] 大圖與小圖使用獨立圖表配置，而非單純縮放同一圖表
- [x] 月份圖使用垂直長條，X 軸顯示 1～12 月，年份顯示於圖表左上方
- [x] 圓餅圖圖例顏色與切片顏色一致
- [x] 統計詳細分析視圖
- [x] 統計結果邊界案例驗證
- [x] 首頁與統計頁小型摘要統計卡統一為「總收藏／待到貨／本月花費／總花費」及一致英文副標格式

## 10. Management
- [x] 作品選擇器
- [x] 周邊類型選擇器
- [x] 流水號選擇器
- [x] 管理頁搜尋
- [x] 作品／類型／流水號選擇與搜尋狀態同步
- [x] 收藏 CRUD
- [x] 表單 validation
- [x] 刪除確認
- [x] 成功提示
- [x] 失敗提示
- [x] 作品管理新增
- [x] 作品管理編輯
- [x] 作品管理移除
- [x] 表單編輯狀態不因重新 render 遺失
- [x] **新增／編輯表單改為完整對應新 Item schema**
- [x] 必填欄位與格式錯誤清楚提示
- [x] 重複 ID / 重複資料安全處理
- [x] 新增／編輯表單支援 quantity
- [x] **分類規則：亞克力是材質，不應作為獨立商品類型；新商品應依實際商品型態分類**
- [x] 管理頁重新排版與 UI/UX 優化
- [x] 新增專用頁面／流程，與現有管理頁職責清楚分離

## 11. GitHub API / Worker
- [x] API layer
- [x] GitHub service
- [x] Worker service
- [x] GET data
- [x] PUT data
- [x] DELETE data
- [x] GET assets
- [x] PUT assets
- [x] DELETE assets
- [x] auth status
- [x] Admin Secret
- [x] Worker GitHub Token
- [x] path whitelist
- [x] 統一 API errors
- [x] UI 不直接組 GitHub REST API request
- [x] API timeout / network failure handling
- [x] CORS / allowed origin
- [x] request payload validation
- [x] response schema validation
- [x] Worker GitHub Token 實際寫入權限驗證與部署後驗證
- [x] **API / Worker 寫入流程支援新 Item 資料夾與 index 路徑**
- [x] **API / Worker 寫入只修改目標 Item／index 檔案，不覆寫其他 Item 資料**

## 12. Write Consistency
- [x] validate
- [x] 先取得最新 remote state
- [x] 建立新 state
- [x] PUT 成功後才更新 Store
- [x] 寫入失敗不污染 Store
- [x] concurrent write protection
- [x] stale state detection
- [x] write operation error recovery
- [x] **新架構寫入前只重新取得目標 Item／index 的最新 state**
- [x] **同一 Item 的 concurrent write / stale state 保護**
- [x] **新增／刪除 Item 時 index 與 Item 資料夾的多檔案 transaction / rollback 策略**
- [x] **圖片與 Item data 的多檔案寫入順序、失敗回復與一致性策略**

## 13. Image Management
- [x] Image upload
- [x] Image replace
- [x] Image delete
- [x] Cover image control
- [x] Image ordering
- [x] orphan image cleanup
- [x] SHA / filename consistency
- [x] Image write failure recovery
- [x] **確認圖片 metadata 在 Item `data.json` 中的保存方式**
- [x] **圖片實體檔案固定隨 Item 存放於該 Item 的 `images/` 目錄**
- [x] **重新設計 image API path resolution，不再依賴舊作品 JSON 圖片路徑**

## 14. Verification
- [x] TypeScript build
- [ ] Desktop smoke test
- [ ] Mobile smoke test
- [x] Router smoke test
- [ ] Collection search/filter/sort test
- [ ] Detail test
- [x] Statistics test
- [ ] Management test
- [x] GitHub API write test
- [x] Image management test
- [ ] Empty/error/loading test
- [x] Data integrity verification
- [x] Production deploy verification
