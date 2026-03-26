export default function UrgencyBadge({ urgency }) {
  const map = {
    high:         { label: 'HIGH',          cls: 'bg-red-900/40 text-red-300 border border-red-700/40' },
    medium:       { label: 'MEDIUM',        cls: 'bg-amber-900/40 text-amber-300 border border-amber-700/40' },
    early_signal: { label: 'EARLY SIGNAL',  cls: 'bg-sky-900/40 text-sky-300 border border-sky-700/40' },
  };
  const { label, cls } = map[urgency] || map.medium;
  return <span className={`tag ${cls}`}>{label}</span>;
}
