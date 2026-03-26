import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Users, ChevronRight, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { getTriggers } from '../lib/api.js';
import UrgencyBadge from '../components/UrgencyBadge.jsx';
import TypeBadge from '../components/TypeBadge.jsx';

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  contacted: 'Contacted',
  meeting_booked: 'Meeting Booked',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  archived: 'Archived',
};

const STATUS_COLORS = {
  new: 'text-gray-400',
  in_progress: 'text-blue-400',
  contacted: 'text-yellow-400',
  meeting_booked: 'text-green-400',
  proposal_sent: 'text-purple-400',
  won: 'text-emerald-400',
  archived: 'text-gray-600',
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-BE', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', urgency: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const data = await getTriggers(active);
      setTriggers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    high: triggers.filter(t => t.urgency === 'high').length,
    total: triggers.length,
    new: triggers.filter(t => t.status === 'new').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Trigger Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Market signals that indicate pharma affiliates need qualitative research
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(f => !f)} className={`btn-ghost ${showFilters ? 'text-gray-100 bg-surface-2' : ''}`}>
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button onClick={load} className="btn-ghost" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/triggers/new" className="btn-primary">
            + Add Trigger
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total triggers', value: counts.total },
          { label: 'High urgency', value: counts.high, accent: 'text-red-400' },
          { label: 'New / unworked', value: counts.new, accent: 'text-brand' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="card px-4 py-3">
            <div className={`text-2xl font-semibold font-mono ${accent || 'text-gray-100'}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Trigger Type</label>
            <select className="input" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">All types</option>
              <option value="ema_approval">EMA Approval</option>
              <option value="riziv_decision">RIZIV/INAMI</option>
              <option value="kce_guideline">KCE Guideline</option>
              <option value="clinical_trial">Clinical Trial</option>
              <option value="vacancy_signal">Vacancy Signal</option>
            </select>
          </div>
          <div>
            <label className="label">Urgency</label>
            <select className="input" value={filters.urgency} onChange={e => setFilters(f => ({ ...f, urgency: e.target.value }))}>
              <option value="">All urgencies</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="early_signal">Early Signal</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setFilters({ type: '', urgency: '', status: '' })}
            className="btn-ghost text-xs col-span-full w-fit"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error} — Make sure the server is running on port 3001.
        </div>
      )}

      {/* Trigger List */}
      {loading && !triggers.length ? (
        <div className="text-center py-16 text-gray-500">Loading triggers…</div>
      ) : !triggers.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No triggers found.</p>
          <Link to="/triggers/new" className="btn-primary mt-4 inline-flex">Add your first trigger</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {triggers.map(trigger => (
            <TriggerRow key={trigger.id} trigger={trigger} />
          ))}
        </div>
      )}
    </div>
  );
}

function TriggerRow({ trigger }) {
  return (
    <Link
      to={`/triggers/${trigger.id}`}
      className="card px-4 py-3.5 flex items-start gap-4 hover:bg-surface-2 transition-colors group block"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={trigger.type} />
          <UrgencyBadge urgency={trigger.urgency} />
          <span className={`text-xs font-mono ${STATUS_COLORS[trigger.status] || 'text-gray-400'}`}>
            {STATUS_LABELS[trigger.status] || trigger.status}
          </span>
        </div>
        <h3 className="font-medium text-gray-100 text-sm truncate">{trigger.title}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {trigger.company_be && (
            <span className="font-medium text-gray-400">{trigger.company_be}</span>
          )}
          {trigger.therapeutic_area && (
            <span>{trigger.therapeutic_area}</span>
          )}
          {trigger.source_url && (
            <a
              href={trigger.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-brand hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={11} />
              {trigger.source_name || 'Source'}
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-600">
        {trigger.suggested_roles?.length > 0 && (
          <span className="flex items-center gap-1">
            <Users size={11} />
            {trigger.suggested_roles.length} roles
          </span>
        )}
        <span>{formatDate(trigger.detected_at)}</span>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </Link>
  );
}
