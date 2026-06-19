# AURA CAFÉ | 精品手作咖啡廳品牌官網與後台管理系統

這是一個為 **AURA CAFÉ** 量身定制的「精品手作咖啡廳品牌官網」與「預約控制台後台管理系統」。採用奢華的曜石黑與古銅金配色，融合流暢的 CSS 動畫與全方位的 RWD 響應式設計，並支援以 Google Sheets (試算表) 作為雲端資料庫。

---

## 📂 專案檔案結構

* `index.html` —— 品牌官網主頁（包含奢華 Hero Banner、關於我們、單品豆展示、職人手沖介紹、空間相簿、線上訂位與訂購表單）。
* `admin.html` —— 預約控制台後台管理頁面（包含安全密碼登入、日期查詢篩選器、當日數據概覽與詳細預約名單表格）。
* `style.css` —— 全域樣式表，包含奢華黑金色彩變數、全語意字型、精美微交互動畫、Lightbox 燈箱樣式與後台控制台樣式。
* `app.js` —— 官網前端互動邏輯（導覽列滾動縮小、漢堡選單、單品豆訂購連動、圖片放大燈箱與 API POST 傳送）。
* `admin.js` —— 後台控制台互動邏輯（記憶體防禦性登入安全驗證、API GET 讀取特定日期、當日組數/人數/時段統計分析，以及無連線時的隨機模擬資料產生器）。
* `images/` —— 精美情境圖片資產目錄（包含 8K 寫實風格的 Hero 背景、空間圖、單品豆特寫與職人手沖特寫）。

---

## ✨ 核心功能特點

1. **極致黑金奢華美學**
   * 使用曜石極致黑 (`#0b0a09`)、暖焦糖古銅金 (`#c5a880`) 與溫潤奶泡白 (`#f9f6f0`)，營造沈浸式的高質感體驗。
   * 標題使用優雅的 Serif 字體 `Playfair Display`，內文使用現代極簡的 `Outfit`。
2. **全裝置 RWD 響應式排版**
   * 完美適應桌機、平板與各尺寸手機螢幕。行動端自動轉化為全螢幕覆蓋的漢堡導覽選單。
3. **無連線模擬展示模式**
   * 在尚未串接 Google Sheets API 前，系統會自動在後台載入**隨機預約名單與統計數據**。每次查詢均能隨機產生不同組合，方便快速展示與交互測試。
4. **Google Sheets 雲端資料庫對接**
   * 支援將網頁表單與您的 Google 個人試算表對接。提交的預約資訊會即時寫入試算表，後台也可依日期即時讀取、篩選並統計當日數據。

---

## 🔑 後台管理登入資訊

* **後台網址**：開啟 `admin.html`
* **管理員密碼**：`aura888`
*(已實施 file:// 隱私防禦機制，直接在本機雙擊開啟 HTML 檔案也不會因為 localStorage 受限而報錯)*

---

## 🛠️ Google Sheets & Apps Script 串接指南

若要將預約表單實際寫入並由後台讀取您的 Google 試算表，請照以下步驟操作：

1. **建立試算表**：新建一個 Google 試算表，命名為 `AURA_CAFÉ_Reservations`。
2. **開啟 Apps Script**：在試算表中點選 **「擴充功能」 -> 「Apps Script」**。
3. **貼上腳本**：清空預設程式碼，貼入以下 Apps Script 腳本：

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["提交時間", "預約日期", "預約時段", "姓名", "電話", "人數", "座位喜好", "備註"]);
    }
    var timestamp = new Date();
    sheet.appendRow([timestamp, data.resDate, data.resTime, data.resName, data.resPhone, data.resGuests, data.resPreference, data.resNote || ""]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Reservation saved" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dateParam = e.parameter.date;
  var result = [];
  if (!dateParam) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Date parameter is required" })).setMimeType(ContentService.MimeType.JSON);
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] })).setMimeType(ContentService.MimeType.JSON);
  
  var range = sheet.getRange(2, 1, lastRow - 1, 8);
  var values = range.getValues();
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowDateStr = "";
    if (row[1] instanceof Date) {
      var d = row[1], month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      rowDateStr = [year, month, day].join('-');
    } else {
      rowDateStr = String(row[1]).trim();
    }
    if (rowDateStr === dateParam) {
      result.push({ timestamp: row[0], resDate: rowDateStr, resTime: row[2], resName: row[3], resPhone: row[4], resGuests: row[5], resPreference: row[6], resNote: row[7] });
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
```

4. **新增部署**：
   * 點選 **「部署」 -> 「新增部署」**。
   * 類型選擇 **「網頁應用程式 (Web App)」**。
   * 將「誰有權限存取」設定為 **「任何人 (Anyone)」**。
   * 部署並授權您的 Google 帳戶後，**複製「網頁應用程式 URL」**。
5. **填入專案 URL**：
   * 開啟 `app.js` 與 `admin.js`，將第 6 行的 `YOUR_GOOGLE_APPS_SCRIPT_URL` 替換為剛才複製的網址並存檔。

---

## 🚀 部署至 Netlify

這是一個純靜態前端專案，您可以使用以下任一方式將其免費發布至 Netlify：

### 方法一：Netlify 網頁拖放部署 (最簡便)
1. 瀏覽並登入 [Netlify 官網](https://www.netlify.com/)。
2. 前往控制台的 **"Sites"** 頁面。
3. 將本機的 `coffee-shop/` 資料夾直接**拖放到網頁底部的拖放區**即可完成部署。

### 方法二：使用 Netlify CLI 終端機部署
如果您想透過命令列工具部署：
1. 全局安裝 Netlify CLI（若尚未安裝）：`npm install -g netlify-cli`
2. 在 `coffee-shop/` 目錄下執行登入：`netlify login`
3. 執行部署：`netlify deploy --prod --dir=.`

---

## 🌐 GitHub Pages 部署

本專案已成功託管於 GitHub，並啟用 GitHub Pages 自動發布：

* **GitHub 儲存庫**：[https://github.com/wildboy2arthur/coffee-shop](https://github.com/wildboy2arthur/coffee-shop)
* **GitHub Pages 線上官網**：[https://wildboy2arthur.github.io/coffee-shop/](https://wildboy2arthur.github.io/coffee-shop/)
* **GitHub Pages 線上後台**：[https://wildboy2arthur.github.io/coffee-shop/admin.html](https://wildboy2arthur.github.io/coffee-shop/admin.html) (預設密碼：`aura888`)
