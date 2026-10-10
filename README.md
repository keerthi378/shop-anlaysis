# Shop Data Analysis System (React + Vite)

## Run in VS Code
1. Unzip the folder and open it in VS Code (File > Open Folder).
2. Open the terminal (Ctrl + `) and run:

       npm install
       npm run dev

3. Open the link shown in the terminal (usually http://localhost:5173).

Data is saved in your browser (localStorage). Use "Reset sample data" in the top bar to restore the demo data.

## Folder structure
- src/App.jsx            page switching, shared state, stock updates
- src/pages/             Dashboard, Products, Sales, Reports
- src/components/        Sidebar, Topbar, StatCard, Modal
- src/utils/             analytics.js (calculations), helpers.js (formatting, CSV export)
- src/data/sampleData.js sample products and sales
- src/hooks/             useLocalStorage.js
