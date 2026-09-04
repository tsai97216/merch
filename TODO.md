# merch 重寫 TODO

> 此文件是本專案目前唯一的進度追蹤清單。每完成一個項目，就更新 `[ ]` → `[x]` 並提交到 GitHub。
>
> 更新規則：不要提前勾選未實際完成的項目；若只完成部分，保留 `[ ]`，可在備註補充目前進度。

## 0. Project Foundation
- [x] 新 merch repo
- [x] TypeScript + Vite
- [x] ES Modules
- [x] GitHub Pages
- [x] CNAME
- [x] Vite production base path
- [x] 基本正式目錄與檔案結構
- [x] TypeScript compile 完全通過
- [x] 統一錯誤處理
- [x] loading / empty / error 狀態完整
- [x] GitHub Actions build 通過
- [x] GitHub Pages deploy 通過
- [ ] `merch.chi.qzz.io` 可正常載入
- [x] JS 失敗時首頁仍保有基本可見內容

## 1. Data Layer
- [x] Work / Item / Image / Purchase / Release / Shipping / AfterSales / Version types
- [x] Schema validation
- [x] 單一 Store：works / items / version / UI / loading / error
- [x] Store subscribe
- [x] Page 不持有自己的資料副本

## 2. Data Migration
- [ ] 建立 migration script
- [ ] 遷移四個作品
- [ ] 遷移目前四個收藏品
- [ ] 保留原 ID
- [ ] 保留 purchase / release / shipping / after-sales / image metadata
- [ ] 檢查 null / 格式
- [ ] 檢查重複 image SHA
- [ ] 完成遷移前後驗證
- [ ] 不修改 `merch-old`

## 3. Version
- [ ] 初始版本 `1.0.0`
- [ ] 版本只有一個來源
- [ ] 版本來源固定為 `public/data/version.json`
- [ ] Major = 大版本／架構世代重寫
- [ ] Minor = 每次完整邏輯／功能修改
- [ ] Patch = GitHub API 新增／移除收藏或圖片
- [ ] reorder / cover replacement 不增加 Patch
- [ ] 不使用版本號作為 module cache
- [ ] 不使用 `?v=version` / `?build=...` 等 cache hack

## 4. Router
- [ ] Hash router
- [ ] `#/home`
- [ ] `#/collection`
- [ ] `#/statistics`
- [ ] `#/management`
- [ ] `#/settings`
- [ ] `#/item/:id`
- [ ] 重新整理可正常進入目前頁面
- [ ] Back / Forward 正常
- [ ] 404 頁面

## 5. UI System
- [ ] 全站 layout
- [ ] Mobile / responsive
- [ ] Button
- [ ] Card
- [ ] Badge
- [ ] Modal
- [ ] Toast
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Item card
- [ ] Item list
- [ ] Item detail
- [ ] Image viewer
- [ ] DOM utility
- [ ] Date utility
- [ ] Format utility
- [ ] 安全 DOM rendering

## 6. Dashboard / Home
- [ ] 總收藏數
- [ ] 已收到
- [ ] 預購中
- [ ] 待到貨
- [ ] 最近新增
- [ ] 最近更新
- [ ] 待處理事項
- [ ] 即將到貨
- [ ] 作品統計
- [ ] 消費統計
- [ ] 快速入口
- [ ] JS 失敗時仍能看到基本首頁

## 7. Collection
- [ ] 全部
- [ ] 作品分類
- [ ] 搜尋
- [ ] Filter
- [ ] Sort
- [ ] 狀態篩選
- [ ] 類別篩選
- [ ] 角色篩選
- [ ] 廠商篩選
- [ ] 卡片顯示模式
- [ ] 清單顯示模式
- [ ] 記住卡片／清單選擇
- [ ] 顯示封面
- [ ] 顯示標題
- [ ] 顯示作品
- [ ] 顯示角色
- [ ] 顯示類別
- [ ] 顯示價格
- [ ] 顯示狀態
- [ ] 顯示預計到貨日期
- [ ] 點擊進入詳細頁

## 8. Item Detail
- [ ] 完整基本資訊
- [ ] 購買資訊
- [ ] 發售資訊
- [ ] 物流資訊
- [ ] 售後資訊
- [ ] 圖片展示
- [ ] 編輯
- [ ] 刪除
- [ ] 返回

## 9. Statistics
- [ ] 按作品統計
- [ ] 按類別統計
- [ ] 按角色統計
- [ ] 按廠商統計
- [ ] 按狀態統計
- [ ] 總消費
- [ ] 各作品消費
- [ ] 各月份消費／新增
- [ ] 集中使用 Date utility
- [ ] 空資料狀態

## 10. Management
- [ ] 收藏 CRUD
- [ ] 表單 validation
- [ ] 刪除確認
- [ ] 成功提示
- [ ] 失敗提示
- [ ] 作品管理新增
- [ ] 作品管理編輯
- [ ] 作品管理移除

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

## 12. Write Consistency
- [ ] validate
- [ ] 先取得最新 remote state
- [ ] 建立新 state
- [ ] PUT 成功後才更新 Store
- [ ] 失敗寫入不產生假 UI 狀態
- [ ] 跨作品移動避免 half-success
- [ ] SHA / optimistic concurrency
- [ ] 成功後再處理版本更新

## 13. Image Management
- [ ] JPG / PNG / WebP / GIF
- [ ] 單張 <= 10 MB
- [ ] 多圖上傳
- [ ] image ID
- [ ] image metadata
- [ ] 第一張圖片作為封面
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

## 14. Settings
- [ ] Admin Secret 設定
- [ ] 登入狀態
- [ ] Worker 連線狀態
- [ ] GitHub API 狀態
- [ ] 重新載入資料
- [ ] 同步狀態
- [ ] 顯示版本
- [ ] 清除本機設定
- [ ] Diagnostics

## 15. Security
- [ ] GitHub Token 不進 frontend
- [ ] Admin Secret 不 commit
- [ ] 安全 DOM rendering
- [ ] API path whitelist
- [ ] Worker auth / method checks
- [ ] XSS 防護
- [ ] 避免大型不安全 `innerHTML`

## 16. Testing
- [ ] Data tests
- [ ] Schema tests
- [ ] Migration tests
- [ ] Statistics tests
- [ ] CRUD tests
- [ ] Image tests
- [ ] Chrome
- [ ] Safari
- [ ] iPhone
- [ ] iPad
- [ ] Desktop
- [ ] JS failure
- [ ] Network failure
- [ ] API failure

## 17. Final Switch
- [ ] Data verification
- [ ] Image verification
- [ ] API verification
- [ ] Worker verification
- [ ] GitHub Actions build
- [ ] GitHub Pages deploy
- [ ] `merch.chi.qzz.io`
- [ ] DNS / HTTPS
- [ ] Mobile verification
- [ ] Management verification
- [ ] `merch-old` 保持不變
- [ ] 新站正式取代舊站
