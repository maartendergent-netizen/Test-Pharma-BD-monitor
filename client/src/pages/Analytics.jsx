import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { getTriggers } from '../lib/api.js';

// ─── Design tokens ───────────────────────────────────────────────────────────
const SURFACE_2 = '#1c2333';
const SURFACE_3 = '#232b3e';
const GRAY_500  = '#6b7280';
const GRAY_400  = '#9ca3af';

const TYPE_COLORS = {
  ema_approval:   '#4f8ef7',
  riziv_decision: '#a78bfa',
  kce_guideline:  '#34d399',
  clinical_trial: '#fbbf24',
  vacancy_signal: '#f87171',
};

const TYPE_LABELS = {
  ema_approval:   'EMA Approval',
  riziv_decision: 'RIZIV/INAMI',
  kce_guideline:  'KCE Guideline',
  clinical_trial: 'Clinical Trial',
  vacancy_signal: 'Vacancy Signal',
};

const URGENCY_COLORS = {
  high:          '#f87171',
  medium:        '#fbbf24',
  early_signal:  '#38bdf8',
};

const URGENCY_LABELS = {
  high:         'High',
  medium:       'Medium',
  early_signal: 'Early Signal',
};

const STATUS_ORDER = [
  'new', 'in_progress', 'contacted', 'meeting_booked', 'proposal_sent', 'won', 'archived',
];
const STATUS_LABELS = {
  new:            'New',
  in_progress:    'In Progress',
  contacted:      'Contacted',
  meeting_booked: 'Meeting Booked',
  proposal_sent:  'Proposal Sent',
  won:            'Won',
  archived:       'Archived',
};
const STATUS_COLORS = {
  new:            '#6b7280',
  in_progress:    '#60a5fa',
  contacted:      '#fbbf24',
  meeting_booked: '#4ade80',
  proposal_sent:  '#c084fc',
  won:            '#34d399',
  archived:       '#374151',
};

// ─── Tooltip styles ───────────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#161b27',
  border: `1px solid ${SURFACE_3}`,
  borderRadius: 8,
  fontSize: 12,
  color: '#e5e7eb',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || 'unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function buildTimeline(triggers) {
  if (!triggers.length) return [];
  const byDay = {};
  triggers.forEach(t => {
    const day = t.detected_at ? t.detected_at.slice(0, 10) : null;
    if (!day) return;
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const sorted = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  return sorted.map(([date, count]) => {
    cumulative += count;
    return {
      date: new Date(date).toLocaleDateString('en-BE', { day: 'numeric', month: 'short' }),
      New: count,
      Total: cumulative,
    };
  });
}

// ─── Chart wrappers ───────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="px-3 py-2 shadow-xl">
      {label && <div className="text-gray-400 mb-1 text-[11px]">{label}</div>}
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px]">
          <span style={{ color: p.color || p.fill }}>●</span>
          <span className="text-gray-300">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTriggers();
      setTriggers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const typeCounts    = countBy(triggers, 'type');
  const urgencyCounts = countBy(triggers, 'urgency');
  const statusCounts  = countBy(triggers, 'status');

  const typeData = Object.entries(typeCounts).map(([k, v]) => ({
    name:  TYPE_LABELS[k] || k,
    value: v,
    color: TYPE_COLORS[k] || '#6b7280',
  }));

  const urgencyData = ['high', 'medium', 'early_signal'].map(k => ({
    name:  URGENCY_LABELS[k],
    value: urgencyCounts[k] || 0,
    color: URGENCY_COLORS[k],
  })).filter(d => d.value > 0);

  const pipelineData = STATUS_ORDER.map(k => ({
    status: STATUS_LABELS[k],
    count:  statusCounts[k] || 0,
    color:  STATUS_COLORS[k],
  })).filter(d => d.count > 0);

  const timelineData = buildTimeline(triggers);

  // ── Therapeutic area top-5 ────────────────────────────────────────────────
  const areaCounts = countBy(triggers, 'therapeutic_area');
  const areaData   = Object.entries(areaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([k, v]) => ({ name: k, count: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of trigger signals, urgency, pipeline health, and activity
          </p>
        </div>
        <button onClick={load} className="btn-ghost" title="Refresh">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="card border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error} — Make sure the server is running on port 3001.
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total triggers',   value: triggers.length,                                    accent: 'text-gray-100' },
          { label: 'High urgency',     value: urgencyCounts['high'] || 0,                        accent: 'text-red-400' },
          { label: 'Active pipeline',  value: (statusCounts['in_progress'] || 0) + (statusCounts['contacted'] || 0) + (statusCounts['meeting_booked'] || 0) + (statusCounts['proposal_sent'] || 0), accent: 'text-blue-400' },
          { label: 'Won',              value: statusCounts['won'] || 0,                          accent: 'text-emerald-400' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="card px-4 py-3">
            <div className={`text-2xl font-semibold font-mono ${accent}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {loading && !triggers.length ? (
        <div className="text-center py-16 text-gray-500">Loading data…</div>
      ) : !triggers.length ? (
        <div className="text-center py-16 text-gray-500">No trigger data yet.</div>
      ) : (
        <>
          {/* Row 1: type pie + urgency bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Trigger type donut */}
            <ChartCard title="Trigger Types" subtitle="Distribution of signal sources">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke={SURFACE_2} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ color: GRAY_400, fontSize: 11 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Urgency bar chart */}
            <ChartCard title="Urgency Breakdown" subtitle="How many triggers per urgency level">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={urgencyData} barCategoryGap="40%" layout="vertical">
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={SURFACE_3} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: GRAY_500, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={85}
                    tick={{ fill: GRAY_400, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: SURFACE_3 }} />
                  <Bar dataKey="value" name="Triggers" radius={[0, 6, 6, 0]}>
                    {urgencyData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: pipeline funnel */}
          <ChartCard title="Sales Pipeline" subtitle="Trigger count at each stage">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData} barCategoryGap="30%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={SURFACE_3} />
                <XAxis
                  dataKey="status"
                  tick={{ fill: GRAY_400, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: GRAY_500, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: SURFACE_3 }} />
                <Bar dataKey="count" name="Triggers" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Row 3: timeline + therapeutic areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Detection timeline */}
            {timelineData.length > 1 && (
              <ChartCard title="Detection Timeline" subtitle="Cumulative triggers detected over time">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={SURFACE_3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: GRAY_500, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: GRAY_500, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="Total"
                      stroke="#4f8ef7"
                      strokeWidth={2}
                      fill="url(#brandGrad)"
                      dot={{ r: 3, fill: '#4f8ef7', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Therapeutic areas */}
            {areaData.length > 0 && (
              <ChartCard title="Therapeutic Areas" subtitle="Top areas by trigger count">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={areaData} layout="vertical" barCategoryGap="35%">
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={SURFACE_3} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: GRAY_500, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={130}
                      tick={{ fill: GRAY_400, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: SURFACE_3 }} />
                    <Bar dataKey="count" name="Triggers" fill="#4f8ef7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}
