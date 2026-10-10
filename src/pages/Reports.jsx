import { useMemo, useState } from "react";
import { Download, IndianRupee, TrendingUp, ReceiptText, Package } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import StatCard from "../components/StatCard.jsx";
import { summarize, monthly, byProduct, byCategory, lowStock, profitOf } from "../utils/analytics.js";
import { money, num, fmtDate, downloadCsv, LOW_STOCK } from "../utils/helpers.js";

export default function Reports({ products, sales }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(
    () => sales.filter((s) => (!from || s.date >= from) && (!to || s.date <= to)),
    [sales, from, to]
  );

  const s = useMemo(() => summarize(filtered, products), [filtered, products]);
  const months = useMemo(() => monthly(filtered), [filtered]);
  const best = useMemo(() => byProduct(filtered).slice(0, 8), [filtered]);
  const cats = useMemo(() => byCategory(filtered), [filtered]);
  const low = useMemo(() => lowStock(products), [products]);
  const growthData = months.filter((m) => m.growth !== null);

  function exportCsv() {
    const headers = ["Date", "Invoice", "Product", "Category", "Quantity", "Unit price", "Total", "Profit"];
    const rows = [...filtered]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [r.date, r.invoice, r.productName, r.category, r.quantity, r.unitPrice, r.total, profitOf(r)]);
    rows.push(["", "", "TOTAL", "", s.unitsSold, "", s.revenue, s.profit]);
    downloadCsv(`sales-report-${from || "start"}-to-${to || "latest"}.csv`, headers, rows);
  }

  return (
    <>
      <div className="toolbar">
        <label className="inline">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="inline">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button className="btn ghost" onClick={() => { setFrom(""); setTo(""); }}>Clear dates</button>
        <button className="btn primary push" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <section className="stats">
        <StatCard icon={IndianRupee} label="Revenue" value={money(s.revenue)} hint={`${filtered.length} sales records`} tone="teal" />
        <StatCard icon={TrendingUp} label="Profit" value={money(s.profit)} hint={`${s.margin.toFixed(1)}% margin`} tone="green" />
        <StatCard icon={ReceiptText} label="Orders" value={num(s.orders)} hint="Unique invoices" tone="amber" />
        <StatCard icon={Package} label="Units sold" value={num(s.unitsSold)} tone="purple" />
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Monthly performance</h2>
          <div className="scroll">
            <table>
              <thead><tr><th>Month</th><th>Revenue</th><th>Profit</th><th>Growth</th></tr></thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.key}>
                    <td>{m.label}</td>
                    <td>{money(m.revenue)}</td>
                    <td>{money(m.profit)}</td>
                    <td>
                      {m.growth === null ? <span className="muted">–</span> : (
                        <span className={"badge " + (m.growth >= 0 ? "green" : "red")}>
                          {m.growth >= 0 ? "▲" : "▼"} {Math.abs(m.growth).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {months.length === 0 && <tr><td colSpan="4" className="muted">No sales in this range.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h2>Monthly sales growth (%)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v) => v + "%"} />
              <Tooltip formatter={(v) => [v.toFixed(1) + "%", "Growth"]} />
              <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                {growthData.map((m, i) => <Cell key={i} fill={m.growth >= 0 ? "#0f9d8a" : "#e4572e"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Category-wise performance</h2>
          <div className="scroll">
            <table>
              <thead><tr><th>Category</th><th>Units</th><th>Revenue</th><th>Profit</th><th>Share</th></tr></thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td><td>{c.units}</td><td>{money(c.revenue)}</td><td>{money(c.profit)}</td>
                    <td>{c.share.toFixed(1)}%</td>
                  </tr>
                ))}
                {cats.length === 0 && <tr><td colSpan="5" className="muted">No sales in this range.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h2>Best-selling products</h2>
          <div className="scroll">
            <table>
              <thead><tr><th>Product</th><th>Units</th><th>Revenue</th><th>Profit</th></tr></thead>
              <tbody>
                {best.map((p) => (
                  <tr key={p.name}><td>{p.name}</td><td>{p.units}</td><td>{money(p.revenue)}</td><td>{money(p.profit)}</td></tr>
                ))}
                {best.length === 0 && <tr><td colSpan="4" className="muted">No sales in this range.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel wide">
          <h2>Low-stock products ({LOW_STOCK} units or fewer)</h2>
          {low.length === 0 ? (
            <p className="muted">No low-stock products.</p>
          ) : (
            <div className="chips">
              {low.map((p) => (
                <span key={p.id} className={"badge " + (p.stock === 0 ? "red" : "amber")}>
                  {p.name}: {p.stock === 0 ? "out of stock" : p.stock + " left"}
                </span>
              ))}
            </div>
          )}
          <p className="muted foot">
            Report period: {from ? fmtDate(from) : "first sale"} to {to ? fmtDate(to) : "latest sale"}
          </p>
        </div>
      </section>
    </>
  );
}
