import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Sales from "./pages/Sales.jsx";
import Reports from "./pages/Reports.jsx";
import useLocalStorage from "./hooks/useLocalStorage.js";
import { SAMPLE_PRODUCTS, SAMPLE_SALES } from "./data/sampleData.js";
import { uid } from "./utils/helpers.js";

const TITLES = { dashboard: "Dashboard", products: "Products", sales: "Sales", reports: "Reports" };

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useLocalStorage("shop.products", SAMPLE_PRODUCTS);
  const [sales, setSales] = useLocalStorage("shop.sales", SAMPLE_SALES);

  /* ---------- products ---------- */
  function saveProduct(data) {
    if (data.id) {
      setProducts((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
    } else {
      setProducts((prev) => [...prev, { ...data, id: uid() }]);
    }
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  /* ---------- sales (also keeps stock in sync) ---------- */
  function saveSale(data, editId) {
    const old = editId ? sales.find((s) => s.id === editId) : null;

    setProducts((prev) =>
      prev.map((p) => {
        let stock = p.stock;
        if (old && p.id === old.productId) stock += old.quantity; // give back the old quantity
        if (p.id === data.productId) stock = Math.max(0, stock - data.quantity); // take the new quantity
        return stock === p.stock ? p : { ...p, stock };
      })
    );

    setSales((prev) =>
      editId ? prev.map((s) => (s.id === editId ? { ...s, ...data } : s)) : [...prev, { ...data, id: uid() }]
    );
  }

  function deleteSale(id) {
    const old = sales.find((s) => s.id === id);
    if (!old) return;
    setProducts((prev) => prev.map((p) => (p.id === old.productId ? { ...p, stock: p.stock + old.quantity } : p)));
    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  function resetData() {
    if (window.confirm("Replace all products and sales with the sample data?")) {
      setProducts(SAMPLE_PRODUCTS);
      setSales(SAMPLE_SALES);
    }
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar title={TITLES[page]} onMenu={() => setMenuOpen(true)} onReset={resetData} />
        <main className="content">
          {page === "dashboard" && <Dashboard products={products} sales={sales} />}
          {page === "products" && <Products products={products} onSave={saveProduct} onDelete={deleteProduct} />}
          {page === "sales" && <Sales products={products} sales={sales} onSave={saveSale} onDelete={deleteSale} />}
          {page === "reports" && <Reports products={products} sales={sales} />}
        </main>
      </div>
    </div>
  );
}
