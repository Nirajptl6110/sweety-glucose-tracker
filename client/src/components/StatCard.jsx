export default function StatCard({ label, value, unit = 'mg/dL', icon: Icon, tone = 'lavender', hint }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon"><Icon size={18} /></span>
      </div>
      <div className="stat-value-row">
        <strong>{value ?? '—'}</strong>
        {value !== null && value !== undefined && <span className="stat-unit">{unit}</span>}
      </div>
      {hint && <span className="stat-hint">{hint}</span>}
    </article>
  );
}
