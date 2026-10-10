import { monthLabel, LOW_STOCK } from "./helpers.js";

export const profitOf = (s) => (s.unitPrice - s.unitCost) * s.quantity;

export function summarize(sales, products) {
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const profit = sales.reduce((a, s) => a + profitOf(s), 0);
  return {
    revenue,
    profit,
    margin: revenue ? (profit / revenue) * 100 : 0,
    salesCount: sales.length,
    orders: new Set(sales.map((s) => s.invoice)).size,
    unitsSold: sales.reduce((a, s) => a + s.quantity, 0),
    stock: products.reduce((a, p) => a + p.stock, 0),
  };
}

export function monthly(sales) {
  const map = {};
  sales.forEach((s) => {
    const key = s.date.slice(0, 7);
    map[key] = map[key] || { key, label: monthLabel(key), revenue: 0, profit: 0, sales: 0, units: 0 };
    map[key].revenue += s.total;
    map[key].profit += profitOf(s);
    map[key].sales += 1;
    map[key].units += s.quantity;
  });
  const arr = Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  return arr.map((m, i) => ({
    ...m,
    growth: i > 0 && arr[i - 1].revenue ? ((m.revenue - arr[i - 1].revenue) / arr[i - 1].revenue) * 100 : null,
  }));
}

export function byProduct(sales) {
  const map = {};
  sales.forEach((s) => {
    const k = s.productName;
    map[k] = map[k] || { name: k, category: s.category, units: 0, revenue: 0, profit: 0 };
    map[k].units += s.quantity;
    map[k].revenue += s.total;
    map[k].profit += profitOf(s);
  });
  return Object.values(map).sort((a, b) => b.units - a.units);
}

export function byCategory(sales) {
  const map = {};
  let total = 0;
  sales.forEach((s) => {
    map[s.category] = map[s.category] || { name: s.category, units: 0, revenue: 0, profit: 0 };
    map[s.category].units += s.quantity;
    map[s.category].revenue += s.total;
    map[s.category].profit += profitOf(s);
    total += s.total;
  });
  return Object.values(map)
    .map((c) => ({ ...c, share: total ? (c.revenue / total) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export const lowStock = (products) =>
  products.filter((p) => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
