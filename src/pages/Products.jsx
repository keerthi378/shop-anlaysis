import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { money, LOW_STOCK } from "../utils/helpers.js";

const EMPTY = { name: "", category: "", price: "", cost: "", stock: "" };

export default function Products({ products, onSave, onDelete }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const list = useMemo(
    () =>
      products.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
        if (cat !== "All" && p.category !== cat) return false;
        if (minPrice !== "" && p.price < Number(minPrice)) return false;
        if (maxPrice !== "" && p.price > Number(maxPrice)) return false;
        if (stockFilter === "In stock" && p.stock <= LOW_STOCK) return false;
        if (stockFilter === "Low stock" && !(p.stock > 0 && p.stock <= LOW_STOCK)) return false;
        if (stockFilter === "Out of stock" && p.stock !== 0) return false;
        return true;
      }),
    [products, q, cat, stockFilter, minPrice, maxPrice]
  );

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const price = Number(form.price);
    const cost = Number(form.cost);
    const stock = Number(form.stock);
    if (!form.name.trim()) return setError("Enter the product name.");
    if (!form.category.trim()) return setError("Enter a category.");
    if (!(price > 0)) return setError("Selling price must be more than 0.");
    if (!(cost >= 0) || form.cost === "") return setError("Enter the cost price (0 or more).");
    if (!Number.isInteger(stock) || stock < 0 || form.stock === "") return setError("Stock must be a whole number, 0 or more.");
    onSave({ id: form.id, name: form.name.trim(), category: form.category.trim(), price, cost, stock });
    setForm(null);
  }

  function openForm(p) {
    setError("");
    setForm(p ? { ...p } : { ...EMPTY });
  }

  function remove(p) {
    if (window.confirm(`Delete "${p.name}"? Past sales of this product are kept.`)) onDelete(p.id);
  }

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input placeholder="Search product name" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option>All</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} aria-label="Stock level">
          {["All", "In stock", "Low stock", "Out of stock"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="small" type="number" min="0" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="small" type="number" min="0" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <button className="btn primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="panel">
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{money(p.cost)}</td>
                  <td>{money(p.price)}</td>
                  <td>
                    <span className={"badge " + (p.stock === 0 ? "red" : p.stock <= LOW_STOCK ? "amber" : "green")}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => openForm(p)} aria-label={"Edit " + p.name}><Pencil size={16} /></button>
                    <button className="icon-btn danger" onClick={() => remove(p)} aria-label={"Delete " + p.name}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="6" className="muted">No products match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="muted foot">{list.length} of {products.length} products · low stock is {LOW_STOCK} units or fewer</p>
      </div>

      {form && (
        <Modal title={form.id ? "Edit product" : "Add product"} onClose={() => setForm(null)}>
          <form className="form" onSubmit={submit}>
            <label>Product name<input value={form.name} onChange={change("name")} autoFocus /></label>
            <label>Category
              <input list="cats" value={form.category} onChange={change("category")} />
              <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
            <div className="row">
              <label>Cost price (₹)<input type="number" min="0" value={form.cost} onChange={change("cost")} /></label>
              <label>Selling price (₹)<input type="number" min="0" value={form.price} onChange={change("price")} /></label>
            </div>
            <label>Stock quantity<input type="number" min="0" step="1" value={form.stock} onChange={change("stock")} /></label>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn primary">Save product</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
