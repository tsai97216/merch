# merch 重寫 TODO

> 此文件是本專案目前唯一的進度追蹤清單。每完成一個項目，就更新 `[ ]` → `[x]` 並提交到 GitHub。
> 更新規則：不要提前勾選未實際完成的項目；若只完成部分，保留 `[ ]`。
> `merch-old` 僅作為歷史參考，不再作為 UI/UX 或功能驗收基準。
> TODO 只追蹤實際需要完成的工作；已否決的方案與禁止事項統一記錄於 `RULES.md`，不在此保留。

## 0. Project Foundation
- [x] 新 merch repo
- [x] TypeScript + Vite
- [x] ES Modules
- [x] GitHub Pages
- [x] CNAME
- [x] Vite production base path
- [x] 基本正式目錄與檔案結構
- [x] 統一錯誤處理
- [x] loading / empty / error 狀態完整
- [x] GitHub Actions build 通過
- [x] GitHub Pages deploy 通過
- [x] `merch.chi.qzz.io` 可正常載入
- [x] JS 失敗時首頁仍保有基本可見內容

## 1. Data Layer
- [x] Work / Item / Image / Purchase / Release / Shipping / AfterSales / Version types
- [x] Item quantity type
- [x] Quantity validation：大於等於 1 的整數
- [x] 舊資料缺少 quantity 時預設為 1
- [x] Schema validation
- [x] 單一 Store：works / items / version / UI / loading / error
- [x] Store subscribe
- [x] Page 不持有自己的資料副本
- [x] Store state immutable 更新原則
- [x] 統一所有 quantity 進入 Store 前的 normalization / validation
- [x] Store 不以 `quantity || 1` 取代正式 quantity validation
- [x] Store 訂閱生命週期與取消訂閱
- [x] Data / UI state 邊界明確

## 2. Data Migration
- [x] 建立 migration script
- [x] 遷移四個作品
- [x] 遷移目前四個收藏品
- [x] 保留原 ID
- [x] 保留 purchase / release / shipping / after-sales / image metadata
- [x] 檢查 null / 格式
- [x] 檢查重複 image SHA
- [ ] 完成遷移前後驗證
- [x] 不修改 `merch-old`

## 3. Version
- [x] 初始版本 `1.0.0`
- [x] 版本只有一個來源
- [x] 版本來源固定為 `public/data/version.json`
- [x] Major = 大版本／架構世代重寫
- [x] Minor = 每次完整邏輯／功能修改
- [x] Patch = GitHub API 新增／移除收藏或圖片
- [x] reorder / cover replacement 不增加 Patch
- [x] 不使用版本號作為 module cache
- [x] 不使用 `?v=version` / `?build=...` 等 cache hack
- [x] UI 版本顯示統一由 `version.json` 提供

## 4. Router
- [x] Hash router
- [x] `#/home`
- [x] `#/collection`
- [x] `#/statistics`
- [x] `#/management`
- [x] `#/settings`
- [x] `#/item/:id` 路由解析
- [x] 重新整理可正常進入目前頁面
- [x] Back / Forward 正常
- [x] 404 頁面
- [x] malformed URL / decodeURIComponent 安全處理
- [x] 多餘 route segments 正確拒絕
- [x] route navigation 與 page render 解耦

## 5. UI System
- [x] 整理 desktop / tablet / mobile breakpoint 規則
- [x] 整理頁面最大寬度、內容留白與主要 grid 規則
- [x] 整理 typography hierarchy 與字重規則
- [x] 整理 color / spacing / radius / shadow design tokens
- [ ] 全站 layout
- [x] Desktop sidebar / navigation
- [x] Mobile navigation
- [ ] Page header / eyebrow / section heading
- [ ] Button
- [ ] Card
- [ ] Panel
- [ ] Badge / Status
- [x] Input / Select / Textarea
- [x] Toolbar / Filter controls
- [ ] Modal
- [ ] Toast
- [x] Loading
- [x] Empty
- [x] Error
- [x] Notice / Alert
- [x] Item card
- [x] Item list
- [x] Item detail 基本顯示
- [x] Image viewer
- [x] Focus-visible / keyboard interaction
- [x] Reduced-motion / animation fallback
- [ ] DOM utility
- [ ] Date utility
- [ ] Format utility
- [x] 安全 DOM rendering
- [x] 統一 class naming / component styling 邊界
- [x] 避免 page-specific CSS 互相覆蓋
- [x] 收藏卡片「已收到」隱藏文字但保留版面空間
- [x] 周邊詳細資訊「已收到」隱藏文字但保留版面空間
- [x] 主要 rendering 與 enhancement module 結構一致
- [x] 移除 MutationObserver 相關實作
- [x] 移除不再需要的 rendering workaround
- [x] 收藏卡片文字區塊固定高度，避免狀態標籤與多行商品名稱造成卡片內容錯位
- [x] 收藏卡片價格數量標記 `×N` 使用與廠商相同的灰色文字

## 6. Dashboard / Home
- [x] 總收藏數
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

## 7. Collection
- [x] 全部
- [x] 作品分類
- [x] 搜尋
- [x] 搜尋支援狀態文字：`預購中`、`待到貨`、`已收到` 等使用者可見狀態
- [x] `待到貨` 搜尋結果包含 `pending + preorder`
- [x] `預購中` 搜尋仍可單獨命中 preorder
- [x] `已收到` 搜尋仍可單獨命中 received
- [x] 搜尋支援多個詞條同時搜尋，採 AND 邏輯
- [x] 多詞條支援空白、`,`、`，`、`、` 等常見分隔方式
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
- [ ] 編輯
- [ ] 刪除
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
- [ ] 各月份消費／新增
- [ ] 集中使用 Date utility
- [ ] 統計計算與 UI rendering 分離
- [x] 空資料狀態
- [x] 金額／數量格式統一
- [ ] 統計結果邊界案例驗證

## 10. Management
- [ ] 收藏 CRUD
- [ ] 表單 validation
- [ ] 刪除確認
- [ ] 成功提示
- [ ] 失敗提示
- [ ] 作品管理新增
- [ ] 作品管理編輯
- [ ] 作品管理移除
- [ ] 表單編輯狀態不因重新 render 遺失
- [ ] 新增／編輯表單完整欄位
- [ ] 必填欄位與格式錯誤清楚提示
- [ ] 重複 ID / 重複資料安全處理
- [ ] 新增／編輯表單支援 quantity

## 11. GitHub API / Worker
- [ ] API layer
- [ ] GitHub service
- [ ] Worker service
- [ ] GET data
- [ ] PUT data
- [ ] DELETE data
- [ ] GET assets
- [ ] PUT assets
- [ ] DELETE assets
- [ ] auth status
- [ ] Admin Secret
- [ ] Worker GitHub Token
- [ ] path whitelist
- [ ] 統一 API errors
- [ ] UI 不直接組 GitHub REST API request
- [ ] API timeout / network failure handling
- [ ] CORS / allowed origin
- [ ] request payload validation
- [ ] response schema validation

## 12. Write Consistency
- [ ] validate
- [ ] 先取得最新 remote state
- [ ] 建立新 state
- [ ] PUT 成功後才更新 Store
- [ ] 寫入失敗不污染 Store
- [ ] concurrent write protection
- [ ] stale state detection
- [ ] write operation error recovery

## 13. Image Management
- [ ] Image upload
- [ ] Image replace
- [ ] Image delete
- [ ] Cover image control
- [ ] Image ordering
- [ ] orphan image cleanup
- [ ] SHA / filename consistency
- [ ] Image write failure recovery

## 14. Verification
- [ ] TypeScript build
- [ ] Desktop smoke test
- [ ] Mobile smoke test
- [ ] Router smoke test
- [ ] Collection search/filter/sort test
- [ ] Detail test
- [ ] Statistics test
- [ ] Management test
- [ ] GitHub API write test
- [ ] Image management test
- [ ] Empty / error / loading test
- [ ] Data integrity verification
- [ ] Production deploy verification

## 15. Final Polish
- [ ] 全站 desktop UI 精修
- [ ] 全站 tablet UI 精修
- [ ] 全站 mobile UI 精修
- [ ] Desktop Statistics / Management / Settings 排版檢查
- [ ] Mobile Statistics / Management / Settings 排版檢查
- [ ] 全站 spacing / typography / alignment 最終檢查
- [ ] 全站互動狀態最終檢查
- [ ] 全站 accessibility 最終檢查
- [ ] 最終 production smoke test
