# Item Schema

> 本文件記錄目前確定的「單一周邊」資料欄位規格，作為新資料儲存架構、Store、API / Worker、管理介面與詳細頁的共同基準。
>
> 核心原則：本網站是個人周邊收藏管理資料庫，優先記錄收藏管理真正需要的資訊，不為完整而加入低價值欄位。

## 1. 正式 JSON 結構

單一 Item 的正式資料位於：

`data/<work>/<category>/<Item ID>/data.json`

```json
{
  "id": "HSRd001",
  "workId": "honkai-star-rail",
  "title": "流螢 春日手信 1/8比例手辦",
  "series": ["春日手信"],
  "characters": ["流螢"],
  "category": "f",
  "manufacturer": "Myethos",
  "quantity": 1,
  "status": "received",
  "description": "",
  "notes": "",
  "purchase": {
    "price": 1375,
    "currency": "TWD",
    "platform": "米哈遊淘寶",
    "date": "2026-08-05"
  },
  "arrival": {
    "expectedDate": null,
    "receivedDate": "2026-09-14"
  },
  "afterSales": {
    "status": "處理中",
    "note": "待換貨"
  },
  "images": [
    {
      "id": "cover",
      "file": "cover.webp",
      "alt": "流螢立牌",
      "isCover": true
    }
  ]
}
```

## 2. 基本資料

| 欄位 | 類型 | 說明 |
|---|---|---|
| `id` | string | 唯一 Item ID，例如 `HSRd001` |
| `workId` | string | 所屬作品 ID |
| `title` | string | 周邊名稱 |
| `series` | string[] | 所屬系列，可為空陣列 |
| `characters` | string[] | 相關角色，可為空陣列 |
| `category` | string | 正式周邊類型 code，依 `ITEM_TYPES.md` |
| `manufacturer` | string | 製造商，可為空字串 |
| `quantity` | integer | 擁有數量，必須 >= 1 |
| `status` | string | 目前狀態，例如 `received`、`preorder`、`pending` |
| `description` | string | 周邊描述，可為空字串 |
| `notes` | string | 個人備註，可為空字串 |

### 明確不加入 `material`

`material` 材質欄位不納入正式 Item schema。`亞克力` 是材質，不是商品類型；商品仍應依實際商品型態使用 `category` 分類。

## 3. 購買

| 欄位 | 類型 | 說明 |
|---|---|---|
| `price` | number | 購買單價 |
| `currency` | string | 金額幣別，例如 `TWD`、`CNY` |
| `platform` | string | 購買平台，例如淘寶、蝦皮、實體店等 |
| `date` | string | 購買日期，使用日期格式 |

不納入：`orderId`、`url`。

## 4. 到貨

正式欄位名稱為 `arrival`。

| 欄位 | 類型 | 說明 |
|---|---|---|
| `expectedDate` | string \| null | 預計到貨日期，可為空 |
| `receivedDate` | string \| null | 實際收到日期，可為空 |

只處理「預計何時到」與「實際何時收到」，不建立獨立物流系統。

## 5. 物流

**不建立 `shipping` 欄位。**

不記錄物流狀態、運送方式、集運／空運／急運等資訊或物流備註。

## 6. 售後

| 欄位 | 類型 | 說明 |
|---|---|---|
| `status` | string | 售後狀態，可為空 |
| `note` | string | 售後備註，可為空 |

不納入 `updatedAt`，不建立完整售後歷程系統。

## 7. 圖片

圖片 metadata 屬於 Item 資料的一部分；實體圖片放在該 Item 自己的 `images/` 目錄。

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

`file` 只能是檔名，不得包含路徑。實際檔案位置固定為：

`data/<work>/<category>/<Item ID>/images/<file>`

## 8. 類型與路徑

`category` 使用 `ITEM_TYPES.md` 的 code，例如 `b`、`c`、`d`、`f`。

Item 資料路徑固定為：

`data/<work>/<category>/<Item ID>/data.json`

Item 圖片路徑固定為：

`data/<work>/<category>/<Item ID>/images/<file>`

Category 的 `index.json` 只保存索引與列表所需的最小 metadata，不取代 Item `data.json`。

## 9. 設計原則

1. **以已擁有的周邊為主要管理對象。**
2. **只保留對收藏管理有實際價值的資料。**
3. **不建立完整物流或訂單管理功能。**
4. **不要求使用者提供難以判斷或維護的資訊。**
5. **欄位可以為空時，不應為了湊完整資料而強迫填寫。**
6. **後續程式實作應以本文件為 Item schema 基準。**
