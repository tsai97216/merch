# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期開發規則放在 `RULES.md`。
>
> **驗收原則：適用的 CI／自動化驗證通過後即可結案；只有 CI 無法覆蓋的外部服務或真實環境契約才需要額外實際驗證。**

## Current state

- **目前正式版本：`1.109.264`。**
- `package.json` 與 `public/data/version.json` 已同步。
- 最新修改 commit：`dd828246b0426c402c80c779d843726462c70483`。
- Works Management Mobile 已確認正常：「新增／編輯作品」與「現有作品」已改為上下單欄，不再互相擠壓。
- 最新修改尚無可宣稱「CI 已通過」的 workflow run，發布前需重新確認。

# P0｜共用 UI 與 Responsive

## 1. Shared Field / Layout 最後收斂
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [x] 日期、文字、Select 等共用控制項高度、寬度與對齊統一。
- [ ] 持續確認共用 Input focus／outline、Modal / Surface、Toolbar / count 沒有重複實作。
- [x] Collection Select／View Button semantic state 已收斂至 shared foundation。
- [x] Responsive layer 中確認無效的舊 Flex-only 宣告已清理。
- [ ] 不以 page-specific CSS workaround 掩蓋共用元件問題。

## 2. 全站 Responsive 最後整理
- [ ] 依 shared foundation 完成最後 Responsive 結構整理，不再新增不必要的分散 breakpoint。
- [x] Works Management viewport CSS 已集中至 `responsive-refinement.css`，Mobile 單欄已完成並驗收。
- [x] Statistics viewport CSS 已集中至 `responsive-refinement.css`，舊 `statistics-mobile.css` 已移除。
- [x] Settings auth viewport CSS 已集中至 `responsive-refinement.css`。
- [x] Mobile Navigation 已改為水平滑動內容流。
- [x] Mobile `main` 701–820px full-width frame 已修正。
- [x] Mobile Navigation <=820px 左右 frame spacing 已統一。
- [x] `src/styles.css` 殘留 Mobile viewport 規則已清理。
- [x] Home「作品消費排行」Mobile spacing 已修正。
- [ ] 驗證 360 / 390 / 430 / 768 / 820 / 1024px Responsive contract。
- [ ] 全面驗證 Home / Collection / Statistics / Add / Management / Shipping / Settings 七頁。
- [ ] 手機卡片必要時由 4 欄降為 2 欄並確認可讀性。
- [ ] Mobile landscape：橫向滾動、按鈕切割、文字重疊、Modal overflow。
- [ ] Header / Mobile Navigation / 主內容 frame spacing 最終驗收。
- [ ] iPad / Tablet 各頁控制列、表單、卡片寬度與換行驗收。

# P1｜頁面控制與結構

## 9. Collection 控制列
- [ ] 重新確認狀態／類型／排序／顯示方式的資訊層級。
- [ ] 確認「全部、待到貨、預購中、已收到」filter 完整且與既有 state 一致。
- [ ] Desktop / Tablet / Mobile shared control 視覺與觸控尺寸一致。
- [ ] Mobile 採三列：搜尋 → 狀態／類型 → 排序／顯示方式。
- [ ] 排序／顯示方式同組靠右，不與狀態／類型互擠。
- [ ] 移除 Collection intro 多餘說明。

## 10. Add 表單
- [ ] 日期、文字、Select 控制項高度／寬度／對齊最終統一。
- [ ] 沿用 shared Field foundation，不建立 Add 專用控制項尺寸。

## 11. Management
- [ ] 管理表單整體結構與視覺跟 Add 一致，沿用 shared foundation。
- [ ] 上方搜尋 Toolbar 第一層結構，待 CI 驗收。
- [ ] 作品／類型／流水號／新增的 Desktop / Tablet 欄位配置，待 CI 驗收。
- [ ] Tablet / iPad 搜尋、結果數量、選擇器寬度／間距／換行驗收。
- [ ] Mobile 搜尋、結果數量、選擇器內容流與文字溢出驗收。
- [x] Mobile「作品管理」新增／編輯與現有作品已上下排列，且已確認正常。
- [ ] 圖片管理區塊布局暫不處理，避免混入不同問題。

## 12. Shipping
- [ ] 重新確認表單與紀錄資訊層級及操作流程。
- [ ] Item 大量資料選擇提供搜尋／Filter／分組等機制。
- [ ] Shipping records 加入分頁或等效的大量資料呈現機制。
- [ ] 分頁、搜尋／篩選與詳細資訊保持資料一致。

## 14. Home 角色排行
- [ ] 相同數量顯示相同名次。
- [ ] 後續名次依競賽排名規則遞延。
- [ ] 驗證排序與顯示邏輯一致。
- [ ] 驗證角色排行與作品消費排行 Panel 內部結構。

# P2｜最終驗收與發布

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

## 19. Responsive Final
- [ ] 360 / 390 / 430 / 768 / 820 / 1024px 自動化驗證。
- [ ] 4→2 cards、控制列換行、文字溢出、按鈕切割、Modal overflow、landscape。
- [ ] Light / Dark mode 下 shared controls、focus、surface、border、radius。

## 20. Functional Regression
- [ ] 七頁基本流程：Home / Collection / Statistics / Add / Shipping / Management / Settings。
- [ ] Search / Filter / Sort / Detail / Add / Edit / Delete。
- [ ] 圖片新增／替換／刪除／主圖／排序與同步狀態。
- [ ] Work / Category / Serial selectors 與管理操作。
- [ ] Error / Loading / Empty / Success / Failure feedback。

## 21. Release Final Checks
- [ ] TypeScript check。
- [ ] Production build。
- [ ] Schema / data integrity。
- [ ] Worker relevant checks。
- [ ] 版本號與 `public/data/version.json` 同步。
- [ ] GitHub Actions / deployment workflow 通過。
- [ ] 正式部署後版本與關鍵頁面確認。

## 執行順序

1. P0 #1 Shared Field / Layout
2. P0 #2 Responsive
3. P1 #9 Collection
4. P1 #10 Add
5. P1 #11 Management
6. P1 #12 Shipping
7. P1 #14 Home ranking
8. P2 #16–18 Data / Flow
9. P2 #19 Responsive final
10. P2 #20 Functional regression
11. P2 #21 Release
