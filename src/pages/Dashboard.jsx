import { useMemo } from "react";
import { ShoppingCart, IndianRupee, TrendingUp, ReceiptText, Package, Boxes, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import StatCard from "../components/StatCard.jsx";
import { summarize, monthly, byProduct, byCategory, lowStock } from "../utils/analytics.js";
import { money, num, fmtDate, COLORS, LOW_STOCK } from "../utils/helpers.js";

const k = (v) => (v >= 1000 ? v / 1000 + "k" : v);
const tip = (v, name) => [money(v), name];

export default function Dashboard({ products, sales }) {
  const s = useMemo(() => summarize(sales, products), [sales, products]);
  const months = useMemo(() => monthly(sales), [sales]);
  const topProducts = useMemo(() => byProduct(sales).slice(0, 6), [sales]);
  const categories = useMemo(() => byCategory(sales), [sales]);
  const low = useMemo(() => lowStock(products), [products]);
  const recent = useMemo(() => [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [sales]);

  const last = months[months.length - 1];
  const prev = months[months.length - 2];
  const growthHint =
    last && prev && last.growth !== null
      ? `${last.growth >= 0 ? "▲" : "▼"} ${Math.abs(last.growth).toFixed(1)}% in ${last.label} vs ${prev.label}`
      : "Add sales in two months to see growth";

  return (
    <>
      <section className="stats">
        <StatCard icon={ShoppingCart} label="Total sales" value={num(s.salesCount)} hint="Sales records" tone="blue" />
        <StatCard icon={IndianRupee} label="Total revenue" value={money(s.revenue)} hint={growthHint} tone="teal" />
        <StatCard icon={TrendingUp} label="Total profit" value={money(s.profit)} hint={`${s.margin.toFixed(1)}% margin`} tone="green" />
        <StatCard icon={ReceiptText} label="Total orders" value={num(s.orders)} hint="Unique invoices" tone="amber" />
        <StatCard icon={Package} label="Products sold" value={num(s.unitsSold)} hint="Units" tone="purple" />
        <StatCard icon={Boxes} label="Available stock" value={num(s.stock)} hint={`${low.length} product(s) low or out`} tone="coral" />
      </section>

      <section className="grid">
        <div className="panel wide">
          <h2>Monthly sales trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={k} />
              <Tooltip formatter={tip} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0f9d8a" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#f2a93b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Sales by category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categories} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [money(v), n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Revenue vs profit by month</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={k} />
              <Tooltip formatter={tip} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3d6fd8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#f2a93b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Best-selling products (units)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [v, "Units sold"]} />
              <Bar dataKey="units" fill="#0f9d8a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2><AlertTriangle size={17} /> Low-stock products</h2>
          {low.length === 0 ? (
            <p className="muted">All products have more than {LOW_STOCK} units in stock.</p>
          ) : (
            <ul className="low-list">
              {low.map((p) => (
                <li key={p.id}>
                  <span>{p.name}<small>{p.category}</small></span>
                  <b className={p.stock === 0 ? "badge red" : "badge amber"}>{p.stock === 0 ? "Out of stock" : p.stock + " left"}</b>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel wide">
          <h2>Recent sales</h2>
          <div className="scroll">
            <table>
              <thead>
                <tr><th>Date</th><th>Invoice</th><th>Product</th><th>Qty</th><th>Total</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.date)}</td>
                    <td>{r.invoice}</td>
                    <td>{r.productName}</td>
                    <td>{r.quantity}</td>
                    <td>{money(r.total)}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan="5" className="muted">No sales yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
