export default function TypeBadge({ type }) {
  const map = {
    ema_approval:    { label: 'EMA Approval',    cls: 'bg-purple-900/40 text-purple-300 border border-purple-700/40' },
    riziv_decision:  { label: 'RIZIV/INAMI',     cls: 'bg-green-900/40 text-green-300 border border-green-700/40' },
    kce_guideline:   { label: 'KCE Guideline',   cls: 'bg-teal-900/40 text-teal-300 border border-teal-700/40' },
    clinical_trial:  { label: 'Clinical Trial',  cls: 'bg-blue-900/40 text-blue-300 border border-blue-700/40' },
    vacancy_signal:  { label: 'Vacancy Signal',  cls: 'bg-orange-900/40 text-orange-300 border border-orange-700/40' },
  };
  const { label, cls } = map[type] || { label: type, cls: 'bg-surface-2 text-gray-400' };
  return <span className={`tag ${cls}`}>{label}</span>;
}
