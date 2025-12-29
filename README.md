# Tokyo Trip 2026 🇯🇵

這個專案是為 2026 年東京旅遊規劃的行程網站，結合了 React 與 Gemini AI 助手。

## 🚀 快速開始

### 1. 安裝依賴

請確保電腦已安裝 Node.js (建議 v18 以上)。

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` (若有) 或直接建立 `.env` 檔案，填入 Gemini API Key：

```
GEMINI_API_KEY=your_api_key_here
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並前往 `http://localhost:3000`。

## 🛠️ 技術棧

- **React**: UI 框架
- **Vite**: 建置工具
- **TypeScript**: 靜態型別檢查
- **Tailwind CSS**: 樣式設計 (透過 CDN 或本地)
- **Google GenAI SDK**: AI 助手功能

## 📦 部署

本專案包含 GitHub Actions 流程，每次推送到 `main` 或 `master` 分支時，會自動部署至 GitHub Pages。

### 設定 GitHub Pages

1.  進入 GitHub Repository Settings > Pages。
2.  將 Source 設定為 `gh-pages` branch。

### 設定 Secrets

若要讓 AI 功能在線上運作，請至 Settings > Secrets and variables > Actions，新增 Repository secret：
- Name: `GEMINI_API_KEY`
- Value: 您的 API Key

## 📂 專案結構

- `index.html`: 入口 HTML
- `index.tsx`: AI 助手邏輯與 UI
- `package.json`: 依賴與腳本設定
- `.github/workflows`: 自動部署設定
