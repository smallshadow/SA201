# SA201 警衛室棟｜網頁模型

此資料夾是完整靜態網站，已附模型與 3D 顯示元件，不需要安裝套件或編譯。

## 先在電腦上看

解壓缩後，用 Chrome 或 Edge 開啟 `index.html`，即可操作。請保留整個資料夾結構。

## 上傳 GitHub 並讓別人瀏覽

1. 在 GitHub 建立儲存庫，例如 `SA201-web`。
2. 把本資料夾**裡面的所有檔案和子資料夾**上傳至儲存庫根目錄；根目錄要直接看到 `index.html`。不要只上傳 ZIP 或 SKP。
3. 到儲存庫的 **Settings → Pages**。
4. Source 選 **Deploy from a branch**；Branch 選 **main**；資料夾選 **/(root)**，按 **Save**。
5. 等待 GitHub 完成發布，從 Pages 頁面複製網站網址給別人。

官方操作說明：[GitHub Pages 發布設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 操作

- 滑鼠左鍵拖曳旋轉；滾輪縮放；右鍵拖曳平移。觸控使用單指旋轉、雙指縮放／平移。
- 「屋頂」控制雨遮、屋面、女兒牆。
- 「大底／底座」同時控制基座、地坪、平台與地坪分縫。
- 「其他構件」可分別控制牆、門窗、桌櫃、格柵、排水、收邊。
- 爆炸圖滑桿：0% 為組合狀態，100% 為最大分離；隱藏狀態會持續生效。
- 「組合復位」只收合構件；「重設所有檢視」恢復全部顯示和預設外觀。
- 室內與俯視按鈕會隱藏屋頂，外觀按鈕會顯示屋頂。
- 爆炸圖是依構件群組分離的展示，不代表實際施工順序。

## 檔案

- `index.html`、`styles.css`、`app.js`：網頁與互動功能。
- `assets/model.js`：由本次 SketchUp 模型匯出的三角面、邊線、材質與分組；不是示意替代模型。
- `assets/SA201_guardhouse.skp`：匯出時目前模型的副本。
- `assets/model-notes.txt`：原模型推定尺寸與簡化說明。
- `vendor/`：隨附 Three.js r170 與 OrbitControls，保留 MIT 授權。

所有資源採相對路徑，可放在 GitHub Pages 儲存庫子路徑。網頁不依賴 CDN、外部字型或後端。需要瀏覽器支援 WebGL 2。

SKP 日後修改不會自動同步網頁；需重新匯出 `assets/model.js`。本次匯出不包含 SketchUp 畫面上的尺寸文字與輔助標註。

Three.js 的 OrbitControls 使用方式參考：[官方文件](https://threejs.org/docs/pages/OrbitControls.html)。
