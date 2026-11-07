export default function Loading({ label = 'Loading your health data…' }) {
  return <div className="loading-state"><span className="spinner" />{label}</div>;
}
