export const SAMPLE_PRODUCTS = [
  { id: "p1", name: "Basmati Rice 5kg", category: "Grocery", cost: 540, price: 620, stock: 48 },
  { id: "p2", name: "Sunflower Oil 1L", category: "Grocery", cost: 138, price: 160, stock: 62 },
  { id: "p3", name: "Toor Dal 1kg", category: "Grocery", cost: 118, price: 142, stock: 9 },
  { id: "p4", name: "Tea Powder 500g", category: "Grocery", cost: 190, price: 235, stock: 34 },
  { id: "p5", name: "Herbal Shampoo 340ml", category: "Personal Care", cost: 165, price: 210, stock: 27 },
  { id: "p6", name: "Bath Soap 4-pack", category: "Personal Care", cost: 96, price: 128, stock: 41 },
  { id: "p7", name: "Toothpaste 200g", category: "Personal Care", cost: 70, price: 95, stock: 8 },
  { id: "p8", name: "Wired Earphones", category: "Electronics", cost: 420, price: 799, stock: 22 },
  { id: "p9", name: "Phone Charger 20W", category: "Electronics", cost: 260, price: 499, stock: 6 },
  { id: "p10", name: "Power Bank 10000mAh", category: "Electronics", cost: 780, price: 1299, stock: 14 },
  { id: "p11", name: "LED Bulb 9W", category: "Electronics", cost: 62, price: 110, stock: 70 },
  { id: "p12", name: "Notebook Pack of 6", category: "Stationery", cost: 84, price: 120, stock: 55 },
  { id: "p13", name: "Gel Pen Box", category: "Stationery", cost: 50, price: 90, stock: 0 },
  { id: "p14", name: "Geometry Box", category: "Stationery", cost: 65, price: 110, stock: 18 },
  { id: "p15", name: "Cotton T-Shirt", category: "Clothing", cost: 320, price: 499, stock: 30 },
  { id: "p16", name: "Denim Jeans", category: "Clothing", cost: 900, price: 1499, stock: 12 },
];

// Deterministic pseudo-random generator so the demo data is the same every time.
let seed = 2026;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const WEIGHT = { Grocery: 3, "Personal Care": 2, Electronics: 2, Stationery: 2, Clothing: 1.5 };

function pickProduct() {
  const total = SAMPLE_PRODUCTS.reduce((a, p) => a + WEIGHT[p.category], 0);
  let r = rnd() * total;
  for (const p of SAMPLE_PRODUCTS) {
    r -= WEIGHT[p.category];
    if (r <= 0) return p;
  }
  return SAMPLE_PRODUCTS[0];
}

// [month, number of sales, days in range]
const PLAN = [
  ["2026-04", 12, 30],
  ["2026-05", 14, 31],
  ["2026-06", 13, 30],
  ["2026-07", 17, 31],
  ["2026-08", 19, 31],
  ["2026-09", 22, 30],
  ["2026-10", 8, 9],
];

const raw = [];
PLAN.forEach(([ym, count, days]) => {
  for (let i = 0; i < count; i++) {
    const p = pickProduct();
    const maxQty = p.price < 200 ? 8 : p.price < 600 ? 4 : 2;
    const quantity = 1 + Math.floor(rnd() * maxQty);
    const day = 1 + Math.floor(rnd() * days);
    raw.push({ date: `${ym}-${String(day).padStart(2, "0")}`, p, quantity });
  }
});
raw.sort((a, b) => a.date.localeCompare(b.date));

let invoice = 1000;
export const SAMPLE_SALES = raw.map((r, i) => {
  if (i === 0 || r.date !== raw[i - 1].date || rnd() > 0.3) invoice++;
  return {
    id: "s" + (i + 1),
    invoice: "INV-" + invoice,
    date: r.date,
    productId: r.p.id,
    productName: r.p.name,
    category: r.p.category,
    quantity: r.quantity,
    unitPrice: r.p.price,
    unitCost: r.p.cost,
    total: r.quantity * r.p.price,
  };
});
