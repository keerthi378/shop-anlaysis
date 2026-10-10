export const LOW_STOCK = 10;
export const COLORS = ["#0f9d8a", "#3d6fd8", "#f2a93b", "#e4572e", "#8a5cd0", "#5b6b7c"];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const money = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const num = (n) => (n || 0).toLocaleString("en-IN");
export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const monthLabel = (ym) =>
  new Date(ym + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export function nextInvoice(sales) {
  const max = sales.reduce((m, s) => {
    const n = parseInt(String(s.invoice).replace(/\D/g, ""), 10);
    return n > m ? n : m;
  }, 1000);
  return "INV-" + (max + 1);
}

export function downloadCsv(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
