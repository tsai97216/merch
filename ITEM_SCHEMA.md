# Item Schema

> 本文件記錄目前確定的「單一周邊」資料欄位規格，作為新資料儲存架構、Store、API / Worker、管理介面與詳細頁的共同基準。
>
> 核心原則：本網站是個人周邊收藏管理資料庫，優先記錄收藏管理真正需要的資訊，不為完整而加入低價值欄位。

## 1. 基本資料

| 欄位 | 類型 | 說明 |
|---|---|---|
| `id` | string | 唯一 Item ID，例如 `HSRd001` |
| `workId` | string | 所屬作品 ID |
| `title` | string | 周邊名稱 |
| `series` | string[] | 所屬系列，可為空 |
| `characters` | string[] | 相關角色，可為空 |
| `category` | string | 周邊類型，依 `RULES.md` 的類型代碼 |
| `manufacturer` | string | 製造商，可為空 |
| `quantity` | integer | 擁有數量，必須 >= 1 |
| `status` | string | 目前狀態，例如 `received`、`preorder`、`pending` |
| `description` | string | 周邊描述，可為空 |
| `notes` | string | 個人備註，可為空 |

### 明確不加入 `material`

`material` 材質欄位不納入正式 Item schema。實際使用時不一定能準確判斷或描述材質，因此不增加這項維護負擔。

`亞克力` 是材質，不是商品類型；商品仍應依實際商品型態使用 `category` 分類。

## 2. 購買

| 欄位 | 類型 | 說明 |
|---|---|---|
| `price` | number | 購買單價 |
| `currency` | string | 金額幣別，例如 `TWD`、`CNY` |
| `platform` | string | 購買平台，例如淘寶、蝦皮、實體店等 |
| `date` | string | 購買日期，使用日期格式 |

### 明確不加入

以下欄位不納入：

- `orderId`
- `url`

本網站主要用途是收藏管理，而非訂單管理，因此不記錄訂單編號或購買連結。

## 3. 到貨

| 欄位 | 類型 | 說明 |
|---|---|---|
| `expectedDate` | string \| null | 預計到貨日期，可為空 |
| `receivedDate` | string \| null | 實際收到日期，可為空 |

到貨資料只處理「預計何時到」與「實際何時收到」，不建立獨立物流系統。

## 4. 物流

**不建立 `shipping` 欄位。**

不記錄：

- 物流狀態
- 運送方式
- 集運／空運／急運等資訊
- 物流備註

原因：這些資訊不是收藏管理的核心需求。對本網站而言，最重要的是周邊是否已收到，因此由 `status`、`expectedDate`、`receivedDate` 即可處理主要需求。

## 5. 售後

| 欄位 | 類型 | 說明 |
|---|---|---|
| `status` | string | 售後狀態，可為空 |
| `note` | string | 售後備註，可為空 |

### 明確不加入

`updatedAt` 不納入正式 Item schema。

售後只需要記錄目前處理狀態與必要備註，不需要建立完整的售後歷程系統。

## 6. 圖片

```json
"images": [
  {
    "id": "cover",
    "file": "cover.webp",
    "alt": "流螢立牌",
    "isCover": true
  }
]
```

圖片 metadata 屬於 Item 資料的一部分；實體圖片則依新儲存架構放在該 Item 自己的 `images/` 目錄。

## 7. 完整結構

```text
Item
│
├─ 基本資料
│  ├─ id
│  ├─ workId
│  ├─ title
│  ├─ series
│  ├─ characters
│  ├─ category
│  ├─ manufacturer
│  ├─ quantity
│  ├─ status
│  ├─ description
│  └─ notes
│
├─ 購買
│  ├─ price
│  ├─ currency
│  ├─ platform
│  └─ date
│
├─ 到貨
│  ├─ expectedDate
│  └─ receivedDate
│
├─ 售後
│  ├─ status
│  └─ note
│
└─ 圖片
   └─ images[]
```

## 8. 設計原則

1. **以已擁有的周邊為主要管理對象。**
2. **只保留對收藏管理有實際價值的資料。**
3. **不建立完整物流或訂單管理功能。**
4. **不要求使用者提供難以判斷或維護的資訊。**
5. **欄位可以為空時，不應為了湊完整資料而強迫填寫。**
6. **後續程式實作應以本文件為 Item schema 基準。**
