import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { money, fmtDate, today, nextInvoice } from "../utils/helpers.js";

export default function Sales({ products, sales, onSave, onDelete }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const categories = useMemo(() => [...new Set(sales.map((s) => s.category))].sort(), [sales]);

  const list = useMemo(
    () =>
      sales
        .filter((s) => {
          const text = (s.productName + " " + s.invoice).toLowerCase();
          if (q && !text.includes(q.toLowerCase())) return false;
          if (cat !== "All" && s.category !== cat) return false;
          if (from && s.date < from) return false;
          if (to && s.date > to) return false;
          if (minAmt !== "" && s.total < Number(minAmt)) return false;
          if (maxAmt !== "" && s.total > Number(maxAmt)) return false;
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date) || b.invoice.localeCompare(a.invoice)),
    [sales, q, cat, from, to, minAmt, maxAmt]
  );

  const filteredTotal = list.reduce((a, s) => a + s.total, 0);
  const selected = form ? products.find((p) => p.id === form.productId) : null;
  const total = form ? (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0) : 0;

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function openForm(sale) {
    setError("");
    setEditId(sale ? sale.id : null);
    setForm(
      sale
        ? { productId: sale.productId, quantity: sale.quantity, unitPrice: sale.unitPrice, date: sale.date, invoice: sale.invoice }
        : { productId: "", quantity: 1, unitPrice: "", date: today(), invoice: nextInvoice(sales) }
    );
  }

  function pickProduct(e) {
    const p = products.find((x) => x.id === e.target.value);
    setForm({ ...form, productId: e.target.value, unitPrice: p ? p.price : "" });
  }

  function submit(e) {
    e.preventDefault();
    const p = products.find((x) => x.id === form.productId);
    const qty = Number(form.quantity);
    const price = Number(form.unitPrice);
    const editing = editId ? sales.find((s) => s.id === editId) : null;

    if (!p) return setError("Choose a product.");
    if (!Number.isInteger(qty) || qty < 1) return setError("Quantity must be a whole number, 1 or more.");
    if (!(price > 0)) return setError("Unit price must be more than 0.");
    if (!form.date) return setError("Choose the sale date.");

    const available = p.stock + (editing && editing.productId === p.id ? editing.quantity : 0);
    if (qty > available) return setError(`Only ${available} unit(s) of ${p.name} in stock.`);

    onSave(
      {
        invoice: form.invoice.trim() || nextInvoice(sales),
        date: form.date,
        productId: p.id,
        productName: p.name,
        category: p.category,
        quantity: qty,
        unitPrice: price,
        unitCost: editing && editing.productId === p.id ? editing.unitCost : p.cost,
        total: qty * price,
      },
      editId
    );
    setForm(null);
  }

  function remove(s) {
    if (window.confirm(`Delete sale ${s.invoice} (${s.productName})? Its stock will be returned.`)) onDelete(s.id);
  }

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input placeholder="Search product or invoice" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option>All</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        <input className="small" type="number" min="0" placeholder="Min ₹" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} />
        <input className="small" type="number" min="0" placeholder="Max ₹" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} />
        <button className="btn primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Record sale
        </button>
      </div>

      <div className="panel">
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Date</th><th>Invoice</th><th>Product</th><th>Category</th><th>Qty</th><th>Unit price</th><th>Total</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
                  <td>{s.invoice}</td>
                  <td>{s.productName}</td>
                  <td>{s.category}</td>
                  <td>{s.quantity}</td>
                  <td>{money(s.unitPrice)}</td>
                  <td><b>{money(s.total)}</b></td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => openForm(s)} aria-label="Edit sale"><Pencil size={16} /></button>
                    <button className="icon-btn danger" onClick={() => remove(s)} aria-label="Delete sale"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="8" className="muted">No sales match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="muted foot">{list.length} of {sales.length} sales · shown total {money(filteredTotal)}</p>
      </div>

      {form && (
        <Modal title={editId ? "Edit sale" : "Record sale"} onClose={() => setForm(null)}>
          <form className="form" onSubmit={submit}>
            <label>Product
              <select value={form.productId} onChange={pickProduct} autoFocus>
                <option value="">Choose a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock} in stock)</option>)}
              </select>
            </label>
            <div className="row">
              <label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={change("quantity")} /></label>
              <label>Unit price (₹)<input type="number" min="0" value={form.unitPrice} onChange={change("unitPrice")} /></label>
            </div>
            <div className="row">
              <label>Date<input type="date" value={form.date} onChange={change("date")} /></label>
              <label>Invoice no.<input value={form.invoice} onChange={change("invoice")} /></label>
            </div>
            <p className="total-line">
              Total amount <strong>{money(total)}</strong>
              {selected && <small> · {selected.stock} in stock</small>}
            </p>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn primary">Save sale</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
