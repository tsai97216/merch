# TODO

> This file tracks implementation status. Only completed items are checked.

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
- [x] Item schema
- [x] Quantity normalization
- [x] Item ID validation
- [x] Duplicate Item ID validation
- [x] Duplicate permanent serial validation
- [x] Local UI state persistence
- [x] Shared Store instance
- [x] Remote data loading with static fallback

## 2. Data Migration
- [ ] 完成遷移前後驗證
- [x] Legacy data normalization
- [x] Quantity migration
- [x] Image metadata migration

## 3. Version
- [x] version.json
- [x] package.json version sync
- [x] UI version rendering
- [x] API write version bump

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
- [ ] 全站 layout
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
- [x] 完整基本資訊
- [x] 購買資訊
- [x] 顯示單價
- [x] 顯示數量
- [x] 顯示數量加權後合計價值
- [x] 發售資訊
- [x] 物流資訊
- [x] 售後資訊
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
- [x] 各月份新增收藏
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
- [ ] 作品管理新增
- [ ] 作品管理編輯
- [ ] 作品管理移除
- [x] 表單編輯狀態不因重新 render 遺失
- [x] 新增／編輯表單完整欄位
- [x] 必填欄位與格式錯誤清楚提示
- [x] 重複 ID / 重複資料安全處理
- [x] 新增／編輯表單支援 quantity
- [ ] 分類規則：亞克力是材質，不應作為獨立商品類型；新商品應依實際商品型態（如立牌）分類
- [ ] 管理頁重新排版與 UI/UX 優化
- [ ] 新增專用頁面／流程，與現有管理頁職責清楚分離

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
- [ ] Worker GitHub Token 實際寫入權限驗證與部署後驗證

## 12. Write Consistency
- [x] validate
- [x] 先取得最新 remote state
- [x] 建立新 state
- [x] PUT 成功後才更新 Store
- [x] 寫入失敗不污染 Store
- [x] concurrent write protection
- [x] stale state detection
- [x] write operation error recovery

## 13. Image Management
- [x] Image upload
- [x] Image replace
- [x] Image delete
- [x] Cover image control
- [x] Image ordering
- [x] orphan image cleanup
- [x] SHA / filename consistency
- [x] Image write failure recovery

## 14. Verification
- [x] TypeScript build
- [ ] Desktop smoke test
- [ ] Mobile smoke test
- [x] Router smoke test
- [ ] Collection search/filter/sort test
- [ ] Detail test
- [x] Statistics test
- [ ] Management test
- [ ] GitHub API write test
- [ ] Image management test
- [ ] Empty/error/loading test
- [x] Data integrity verification
- [x] Production deploy verification

## 15. Final Polish
- [ ] desktop / tablet / mobile UI polish
- [ ] desktop / mobile Statistics / Management / Settings layout checks
- [ ] spacing / typography / alignment
- [ ] interaction states
- [ ] accessibility
- [ ] final production smoke test

## 16. Architecture Follow-up
- [x] shared Store instance
- [x] Management no independent items copy
- [x] Statistics shared Store
- [x] Home enhancement / main rendering single ownership
- [x] ensure Store update sync across Home / Collection / Statistics / Management / Detail
- [x] enhancement lifecycle check
- [ ] all cross-page / dynamic interactions use event delegation and single responsibility
- [ ] full regression verification

## 17. Discovered Issues / Regression Candidates
- [ ] 修正 Home 角色排行的跨頁搜尋：目前 `.ranking-panel` 的事件防護會攔截角色排行項目的搜尋轉跳，需確保點擊角色後能正確導向 Collection 並套用角色搜尋條件
- [ ] 修正 Home「作品消費排行」顯示邏輯：排行標題與完整排行 Modal 是消費金額，但 Home 小圖目前使用數量作為排行值，需統一為消費排行語意與計算方式
- [ ] 統一 Migration / Verify / 現行資料 schema：目前 `scripts/migrate.mjs`、`scripts/verify-data.mjs` 與 `public/data/works/*.json` 對 work 欄位結構存在不一致，需完成遷移後資料格式的單一規格與前後驗證
- [ ] 落實商品分類規則並處理既有資料：`亞克力` 為材質而非商品類型，需確認現有資料中的相關分類並依實際商品型態修正，同時避免管理介面再次建立錯誤分類
- [ ] 實際驗證 Worker GitHub Token 寫入流程：除了權限與 Secret 存在性檢查外，需完成部署後實際 API 寫入／讀回驗證，確認 Worker 能真正修改 `tsai97216/merch` 資料
- [ ] 完成跨頁與動態互動的事件委派檢查：逐一檢查 Home / Collection / Statistics / Management / Detail / Modal 的動態元素，避免重複 listener、事件攔截或責任邊界不清
- [ ] 完成全站回歸檢查並重新驗證既有已勾選 TODO：特別確認 Home、Collection、Detail、Statistics、Management、Settings 在資料更新、Router 切換、Modal 開關與重新 render 後仍保持一致
