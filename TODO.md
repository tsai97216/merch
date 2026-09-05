# merch 重寫 TODO

> 此文件是本專案目前唯一的進度追蹤清單。每完成一個項目，就更新 `[ ]` → `[x]` 並提交到 GitHub。
> 更新規則：不要提前勾選未實際完成的項目；若只完成部分，保留 `[ ]`，可在備註補充目前進度。
> UI/UX 與功能參考基準：`tsai97216/merch-old`。新架構重新實作，不直接複製舊版程式碼。

## 0. Project Foundation
- [x] 新 merch repo
- [x] TypeScript + Vite
- [x] ES Modules
- [x] GitHub Pages
- [x] CNAME
- [x] Vite production base path
- [x] 基本正式目錄與檔案結構
- [x] TypeScript compile 完全通過
- [ ] 統一錯誤處理
- [x] loading / empty / error 狀態完整
- [x] GitHub Actions build 通過
- [x] GitHub Pages deploy 通過
- [x] `merch.chi.qzz.io` 可正常載入
- [x] JS 失敗時首頁仍保有基本可見內容

## 1. Data Layer
- [x] Work / Item / Image / Purchase / Release / Shipping / AfterSales / Version types
- [x] Schema validation
- [x] 單一 Store：works / items / version / UI / loading / error
- [x] Store subscribe
- [x] Page 不持有自己的資料副本
- [x] Store state immutable 更新原則
- [x] Store 訂閱生命週期與取消訂閱
- [x] Data / UI state 邊界明確

## 2. Data Migration
- [ ] 建立 migration script
- [x] 遷移四個作品
- [x] 遷移目前四個收藏品
- [x] 保留原 ID
- [x] 保留 purchase / release / shipping / after-sales / image metadata
- [x] 檢查 null / 格式
- [ ] 檢查重複 image SHA
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
- [x] **以 `merch-old` 為 UI/UX 與功能參考基準，整體視覺與操作體驗原則上保持高度一致**
- [ ] 重現 `merch-old` 的整體 Layout、Sidebar、Navigation 與內容區配置
- [ ] 重現 `merch-old` 的頁面 Header / eyebrow / section heading
- [ ] 重現 `merch-old` 的 Card / Panel / Item Card / Item List 視覺語言
- [ ] 重現 `merch-old` 的 Button / Badge / Status / Tag 狀態
- [ ] 重現 `merch-old` 的 Input / Select / Textarea / Toolbar / Filter controls
- [ ] 重現 `merch-old` 的 Modal / Toast / Notice / Alert
- [ ] 重現 `merch-old` 的圖片展示與 Image Viewer 體驗
- [ ] 重現 `merch-old` 的卡片／清單收藏切換體驗
- [ ] 重現 `merch-old` 的 Dashboard / Collection / Detail / Statistics / Management / Settings 頁面結構
- [ ] 整理 `merch-old` 視覺規格：配色／字體／間距／圓角／陰影／元件狀態
- [x] 整理 desktop / tablet / mobile breakpoint 規則
- [x] 整理頁面最大寬度、內容留白與主要 grid 規則
- [x] 整理 typography hierarchy 與字重規則
- [x] 整理 color / spacing / radius / shadow design tokens
- [ ] 全站 layout
- [ ] Desktop sidebar / navigation
- [ ] Mobile navigation
- [ ] Page header / eyebrow / section heading
- [ ] Button
- [ ] Card
- [ ] Panel
- [ ] Badge / Status
- [ ] Input / Select / Textarea
- [ ] Toolbar / Filter controls
- [ ] Modal
- [ ] Toast
- [x] Loading
- [x] Empty
- [x] Error
- [x] Notice / Alert
- [ ] Item card
- [ ] Item list
- [ ] Item detail
- [ ] Image viewer
- [x] Focus-visible / keyboard interaction
- [x] Reduced-motion / animation fallback
- [ ] DOM utility
- [ ] Date utility
- [ ] Format utility
- [x] 安全 DOM rendering
- [x] 統一 class naming / component styling 邊界
- [x] 避免 page-specific CSS 互相覆蓋

## 6. Dashboard / Home
- [x] 總收藏數
- [ ] 已收到
- [ ] 預購中
- [ ] 待到貨
- [x] 最近新增
- [ ] 最近更新
- [ ] 待處理事項
- [ ] 即將到貨
- [x] 作品統計
- [x] 消費統計
- [x] 快速入口
- [x] JS 失敗時仍能看到基本首頁
- [x] Home 資料區塊在空資料時仍保持合理排版

## 7. Collection
- [x] 全部
- [x] 作品分類
- [x] 搜尋
- [x] Filter
- [x] Sort
- [x] 狀態篩選
- [ ] 類別篩選
- [ ] 角色篩選
- [ ] 廠商篩選
- [x] 卡片顯示模式
- [x] 清單顯示模式
- [x] 記住卡片／清單選擇
- [x] 顯示封面
- [x] 顯示標題
- [x] 顯示作品
- [x] 顯示角色
- [x] 顯示類別
- [x] 顯示價格
- [x] 顯示狀態
- [ ] 顯示預計到貨日期
- [x] 點擊進入詳細頁
- [x] 篩選條件組合正確
- [x] 搜尋／篩選／排序狀態與 Store 同步
- [x] 無結果 Empty State
- [x] 圖片載入失敗 fallback
- [ ] 卡片與清單在手機版保持可用

## 8. Item Detail
- [x] 完整基本資訊
- [x] 購買資訊
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
- [ ] 鍵盤關閉與 focus 管理

## 9. Statistics
- [x] 按作品統計
- [x] 按類別統計
- [ ] 按角色統計
- [ ] 按廠商統計
- [ ] 按狀態統計
- [x] 總消費
- [ ] 各作品消費
- [ ] 各月份消費／新增
- [ ] 集中使用 Date utility
- [x] 空資料狀態
- [ ] 統計計算與 UI rendering 分離
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
- [ ] 失敗寫入不產生假 UI 狀態
- [ ] 跨作品移動避免 half-success
- [ ] SHA / optimistic concurrency
- [ ] 成功後再處理版本更新
- [ ] concurrent write conflict 清楚提示
- [ ] 版本更新失敗時定義 rollback / recovery 策略
- [ ] 不讓部分成功留下不一致資料

## 13. Image Management
- [ ] JPG / PNG / WebP / GIF
- [ ] 單張 <= 10 MB
- [ ] 多圖上傳
- [ ] image ID
- [x] image metadata
- [x] 第一張圖片作為封面
- [ ] 設定封面
- [ ] 刪除圖片
- [ ] 重新排序
- [ ] 刪除封面後自動選下一張
- [ ] 新增圖片 Patch +1
- [ ] 刪除圖片 Patch +1
- [ ] reorder 不增加 Patch
- [ ] cover replacement 不增加 Patch
- [ ] duplicate SHA 處理
- [ ] 上傳失敗 rollback
- [ ] image path / URL 正規化
- [ ] MIME type / extension 驗證
- [x] 空圖片／破損圖片 fallback
- [ ] 圖片排序結果與 metadata 一致

## 14. Settings
- [ ] Admin Secret 設定
- [ ] 登入狀態
- [ ] Worker 連線狀態
- [ ] GitHub API 狀態
- [ ] 重新載入資料
- [ ] 同步狀態
- [x] 顯示版本
- [ ] 清除本機設定
- [ ] Diagnostics
- [ ] 設定值儲存與讀取失敗處理
- [ ] 敏感設定不顯示明文

## 15. Security
- [ ] GitHub Token 不進 frontend
- [ ] Admin Secret 不 commit
- [x] 安全 DOM rendering
- [ ] API path whitelist
- [ ] Worker auth / method checks
- [x] XSS 防護
- [ ] 避免大型不安全 `innerHTML`
- [ ] 外部 URL / image URL 驗證
- [ ] 使用者輸入內容一律視為不可信
- [ ] 不把 API error 原文直接當 HTML rendering
- [ ] sensitive data 不進 console / diagnostics

## 16. Testing
- [ ] Data tests
- [ ] Schema tests
- [ ] Migration tests
- [ ] Statistics tests
- [ ] CRUD tests
- [ ] Image tests
- [ ] Router tests
- [ ] UI state tests
- [ ] Error boundary tests
- [ ] Chrome
- [ ] Safari
- [ ] iPhone
- [ ] iPad
- [ ] Desktop
- [x] JS failure
- [ ] Network failure
- [ ] API failure
- [ ] Empty data
- [ ] malformed data
- [ ] concurrent write conflict

## 17. Final Switch
- [ ] Data verification
- [ ] Image verification
- [ ] API verification
- [ ] Worker verification
- [x] GitHub Actions build
- [x] GitHub Pages deploy
- [x] `merch.chi.qzz.io`
- [ ] DNS / HTTPS
- [ ] Mobile verification
- [ ] Management verification
- [x] `merch-old` 保持不變
- [ ] 新站正式取代舊站
