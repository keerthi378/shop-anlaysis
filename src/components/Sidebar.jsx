import { LayoutDashboard, Package, ReceiptText, FileBarChart, Store } from "lucide-react";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "sales", label: "Sales", icon: ReceiptText },
  { id: "reports", label: "Reports", icon: FileBarChart },
];

export default function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={"sidebar" + (open ? " open" : "")}>
        <div className="brand">
          <Store size={24} />
          <div>
            <strong>ShopLens</strong>
            <span>Sales analysis</span>
          </div>
        </div>
        <nav>
          {ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={"nav-item" + (page === id ? " active" : "")}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <p className="side-note">Data is saved in this browser.</p>
      </aside>
    </>
  );
}
