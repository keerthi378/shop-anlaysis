import { Menu, RotateCcw } from "lucide-react";

export default function Topbar({ title, onMenu, onReset }) {
  const date = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="topbar-title">
        <h1>{title}</h1>
        <span>{date}</span>
      </div>
      <button className="btn ghost" onClick={onReset}>
        <RotateCcw size={16} /> Reset sample data
      </button>
      <div className="avatar" title="Shop owner">SO</div>
    </header>
  );
}
