export default function StatCard({ icon: Icon, label, value, hint, tone = "teal" }) {
  return (
    <div className="stat">
      <div className={"stat-icon " + tone}>
        <Icon size={20} />
      </div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}
