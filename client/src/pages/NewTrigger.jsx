import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createTrigger } from '../lib/api.js';
import { PHARMA_COMPANIES, TRIGGER_ROLES } from '../lib/searchLinks.js';

const TRIGGER_TYPES = [
  { value: 'ema_approval',   label: 'EMA Approval',   hint: 'CHMP positive opinion or marketing authorisation' },
  { value: 'riziv_decision', label: 'RIZIV/INAMI',     hint: 'Reimbursement dossier submitted or decided by CTG/CRM' },
  { value: 'kce_guideline',  label: 'KCE Guideline',   hint: 'New KCE report changing treatment recommendations' },
  { value: 'clinical_trial', label: 'Clinical Trial',  hint: 'Phase III trial with active Belgian sites' },
  { value: 'vacancy_signal', label: 'Vacancy Signal',  hint: 'Pharma affiliate hiring Brand Manager / Medical Advisor' },
];

const SOURCE_DEFAULTS = {
  ema_approval:   { name: 'EMA — CHMP Positive Opinion', url: 'https://www.ema.europa.eu/en/medicines/human/EPAR' },
  riziv_decision: { name: 'RIZIV/INAMI — Decision', url: 'https://www.riziv.fgov.be/nl/themas/kost-terugbetaling/door-ziekenfonds/geneesmiddel-gezondheidsproduct/terugbetalen/specialiteiten/wijzigingen' },
  kce_guideline:  { name: 'KCE — Report', url: 'https://www.kce.fgov.be/en/publications/all-reports' },
  clinical_trial: { name: 'ClinicalTrials.gov — Phase III', url: 'https://clinicaltrials.gov/search?locStr=Belgium&country=Belgium&phase=PHASE3' },
  vacancy_signal: { name: 'LinkedIn Jobs — Belgium', url: 'https://www.linkedin.com/jobs/search/?keywords=pharmaceutical&location=Belgium' },
};

const URGENCY_OPTIONS = [
  { value: 'high',         label: 'HIGH — Immediate action (launch <12m, reimbursement pending)' },
  { value: 'medium',       label: 'MEDIUM — Act within 1–3 months' },
  { value: 'early_signal', label: 'EARLY SIGNAL — Long-term opportunity (18+ months)' },
];

export default function NewTrigger() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    type: 'ema_approval',
    title: '',
    description: '',
    company: '',
    company_be: '',
    company_domain: '',
    therapeutic_area: '',
    urgency: 'high',
    source_name: SOURCE_DEFAULTS.ema_approval.name,
    source_url: SOURCE_DEFAULTS.ema_approval.url,
    suggested_roles: TRIGGER_ROLES.ema_approval,
  });

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleTypeChange(type) {
    const src = SOURCE_DEFAULTS[type];
    const roles = TRIGGER_ROLES[type];
    setForm(f => ({
      ...f,
      type,
      source_name: src.name,
      source_url: src.url,
      suggested_roles: roles,
    }));
  }

  function handleCompanySelect(e) {
    const company = PHARMA_COMPANIES.find(c => c.name === e.target.value);
    if (company) {
      setForm(f => ({
        ...f,
        company: company.name,
        company_be: company.be,
        company_domain: company.domain,
      }));
    }
  }

  function handleRoleToggle(role) {
    setForm(f => {
      const current = f.suggested_roles || [];
      return {
        ...f,
        suggested_roles: current.includes(role)
          ? current.filter(r => r !== role)
          : [...current, role],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const trigger = await createTrigger(form);
      navigate(`/triggers/${trigger.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const ALL_ROLES = ['Brand Manager', 'Market Access Manager', 'Medical Advisor',
    'BU Director', 'Customer Insights Manager', 'Head of Marketing'];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-4 transition-colors">
          <ArrowLeft size={12} /> Dashboard
        </Link>
        <h1 className="text-xl font-semibold">Add Trigger</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manually log a new market signal</p>
      </div>

      {error && (
        <div className="card border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trigger Type */}
        <div className="card p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-300">Trigger Type</div>
          <div className="grid grid-cols-1 gap-2">
            {TRIGGER_TYPES.map(t => (
              <label key={t.value} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${form.type === t.value ? 'border-brand/40 bg-brand/10' : 'border-surface-3 hover:bg-surface-2'}`}>
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={form.type === t.value}
                  onChange={() => handleTypeChange(t.value)}
                  className="mt-0.5 accent-brand"
                />
                <div>
                  <div className="text-sm font-medium text-gray-200">{t.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.hint}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Core Info */}
        <div className="card p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-300">Trigger Details</div>

          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="e.g. Datopotamab deruxtecan — NSCLC 2nd line"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
            <p className="text-[11px] text-gray-600 mt-1">Format: Product Name — Indication</p>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief context about this trigger and why it's relevant…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Urgency *</label>
            <select className="input" value={form.urgency} onChange={e => set('urgency', e.target.value)}>
              {URGENCY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Company */}
        <div className="card p-4 space-y-4">
          <div className="text-xs font-semibold text-gray-300">Company</div>

          <div>
            <label className="label">Quick select</label>
            <select className="input" onChange={handleCompanySelect} value="">
              <option value="">— Select a company —</option>
              {PHARMA_COMPANIES.map(c => (
                <option key={c.name} value={c.name}>{c.be}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Company name</label>
              <input className="input" placeholder="AstraZeneca" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <label className="label">Belgian affiliate name</label>
              <input className="input" placeholder="AstraZeneca Belgium" value={form.company_be} onChange={e => set('company_be', e.target.value)} />
            </div>
            <div>
              <label className="label">Company domain (for Hunter.io)</label>
              <input className="input" placeholder="astrazeneca.com" value={form.company_domain} onChange={e => set('company_domain', e.target.value)} />
            </div>
            <div>
              <label className="label">Therapeutic area</label>
              <input className="input" placeholder="Oncology — Lung" value={form.therapeutic_area} onChange={e => set('therapeutic_area', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="card p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-300">Source Link</div>
          <div>
            <label className="label">Source name</label>
            <input className="input" placeholder="EMA — CHMP Positive Opinion" value={form.source_name} onChange={e => set('source_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Source URL</label>
            <input className="input" type="url" placeholder="https://…" value={form.source_url} onChange={e => set('source_url', e.target.value)} />
          </div>
        </div>

        {/* Suggested roles */}
        <div className="card p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-300">Roles to Target</div>
          <p className="text-xs text-gray-500">Select which roles to generate contact search links for</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleToggle(role)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  form.suggested_roles?.includes(role)
                    ? 'border-brand/40 bg-brand/10 text-brand'
                    : 'border-surface-3 text-gray-400 hover:border-surface-3 hover:bg-surface-2'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || !form.title.trim()} className="btn-primary">
            {saving ? 'Saving…' : 'Save Trigger'}
          </button>
          <Link to="/" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
