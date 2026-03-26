import { Link } from 'react-router-dom';
import { Radar, UserSearch, Database, MessageSquare, ExternalLink } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Radar,
    title: 'Detect Triggers',
    color: 'text-purple-400',
    bg: 'bg-purple-900/20 border-purple-700/30',
    description:
      'Monitor EMA, RIZIV/INAMI, KCE, ClinicalTrials.gov, and LinkedIn Jobs for market signals that indicate a pharma affiliate needs qualitative market research.',
    detail: [
      'EMA CHMP positive opinion → affiliate preparing Belgian launch (12–18 months)',
      'RIZIV/INAMI dossier submitted → prescriber readiness research needed urgently',
      'KCE guideline update → affiliates need to understand prescriber reaction',
      'Phase III Belgian sites active → early landscaping opportunity (18–24 months)',
      'Brand Manager / Medical Advisor vacancy → strategic franchise investment',
    ],
  },
  {
    number: '02',
    icon: UserSearch,
    title: 'Find Real Contacts',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-700/30',
    description:
      'Per trigger, the tool generates pre-filtered search links for LinkedIn, Sales Navigator, Apollo.io, and Hunter.io. You click, find the actual person, and add them.',
    detail: [
      'LinkedIn Search — free, filter by role + company + Belgium',
      'Sales Navigator — advanced B2B filtering with InMail (~€80/month)',
      'Apollo.io — verified B2B database with emails (~€50/month)',
      'Hunter.io — email patterns per company domain (free / ~€40/month)',
    ],
  },
  {
    number: '03',
    icon: Database,
    title: 'Save & Enrich',
    color: 'text-green-400',
    bg: 'bg-green-900/20 border-green-700/30',
    description:
      'Store contacts (name, role, email, phone, LinkedIn URL) per trigger. Build a CRM-like database over time. Every contact is linked to the specific trigger that motivated the outreach.',
    detail: [
      'Add name, role, email, phone, and LinkedIn profile URL',
      'Contacts persist across sessions in a real database',
      'Link each contact to the specific trigger that motivated the outreach',
      'Edit or delete contacts as your database evolves',
    ],
  },
  {
    number: '04',
    icon: MessageSquare,
    title: 'Personalised Outreach',
    color: 'text-amber-400',
    bg: 'bg-amber-900/20 border-amber-700/30',
    description:
      'Auto-generate LinkedIn messages, emails, and call scripts personalised with the contact\'s real name and the specific trigger context. One-click copy or open in mail/LinkedIn.',
    detail: [
      'LinkedIn connection request (≤300 chars) or InMail draft',
      'Email with subject line and personalised body',
      'Call script: 30-second opening with clear ask',
      'All templates reference the specific trigger (product, decision, guideline…)',
    ],
  },
];

const TRIGGER_TYPES = [
  { label: 'EMA Approval', color: 'bg-purple-900/40 text-purple-300', sources: ['EMA CHMP Opinions (monthly)', 'EMA Open Data Portal'] },
  { label: 'RIZIV/INAMI', color: 'bg-green-900/40 text-green-300', sources: ['RIZIV wijzigingen page', 'CTG meeting agendas'] },
  { label: 'KCE Guideline', color: 'bg-teal-900/40 text-teal-300', sources: ['KCE Publications (all reports)', 'Filter: pharma-relevant TAs'] },
  { label: 'Clinical Trial', color: 'bg-blue-900/40 text-blue-300', sources: ['ClinicalTrials.gov API v2', 'Filter: Phase 3 + Belgium'] },
  { label: 'Vacancy Signal', color: 'bg-orange-900/40 text-orange-300', sources: ['LinkedIn Jobs (manual check)', 'Google Alerts for pharma Belgium'] },
];

export default function HowItWorks() {
  return (
    <div className="max-w-3xl space-y-10">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-semibold">How It Works</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Pharma BD Monitor flips business development from reactive to proactive.
          Instead of waiting for RFPs, we detect the moment a pharma affiliate is most likely to need
          qualitative market research — and reach out with a personalised message referencing their specific situation.
        </p>
      </div>

      {/* 4 Steps */}
      <div className="space-y-4">
        {STEPS.map(step => (
          <div key={step.number} className={`card border p-5 space-y-3 ${step.bg}`}>
            <div className="flex items-start gap-4">
              <div className={`font-mono text-2xl font-bold ${step.color} opacity-40 leading-none mt-0.5`}>
                {step.number}
              </div>
              <div className="flex-1">
                <div className={`flex items-center gap-2 font-semibold ${step.color}`}>
                  <step.icon size={16} />
                  {step.title}
                </div>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{step.description}</p>
                <ul className="mt-3 space-y-1">
                  {step.detail.map((d, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-gray-700 mt-0.5">→</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trigger Sources */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Data Sources to Monitor</h2>
        <div className="space-y-2">
          {TRIGGER_TYPES.map(t => (
            <div key={t.label} className="card px-4 py-3 flex items-start gap-4">
              <span className={`tag ${t.color} flex-shrink-0 mt-0.5`}>{t.label}</span>
              <ul className="flex-1 space-y-0.5">
                {t.sources.map((s, i) => (
                  <li key={i} className="text-xs text-gray-500">{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Urgency Classification</h2>
        <div className="space-y-2">
          {[
            { level: 'HIGH', cls: 'bg-red-900/40 text-red-300 border-red-700/40', example: 'Positive CHMP opinion, CTG dossier submitted', criteria: 'Immediate action. Launch within 12 months, or reimbursement decision pending.' },
            { level: 'MEDIUM', cls: 'bg-amber-900/40 text-amber-300 border-amber-700/40', example: 'New KCE report, Brand Manager vacancy', criteria: 'Act within 1–3 months. Guidelines changed, strategic hiring signal.' },
            { level: 'EARLY SIGNAL', cls: 'bg-sky-900/40 text-sky-300 border-sky-700/40', example: 'Phase III with Belgian sites active', criteria: 'Long-term opportunity. 18+ months to potential launch.' },
          ].map(u => (
            <div key={u.level} className="card px-4 py-3 flex items-start gap-4">
              <span className={`tag border ${u.cls} flex-shrink-0 mt-0.5`}>{u.level}</span>
              <div>
                <p className="text-xs text-gray-400">{u.criteria}</p>
                <p className="text-xs text-gray-600 mt-0.5">e.g. {u.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GDPR Note */}
      <div className="card border-surface-3 bg-surface-2 p-4 space-y-2">
        <h2 className="text-sm font-semibold text-gray-300">GDPR — Legitimate Interest</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          This tool stores professional B2B contact data under GDPR Article 6.1.f (legitimate interest).
          Only business email, phone, job title, and LinkedIn profile are stored — no personal data.
          Every outreach message is directly relevant to the contact's professional function.
          Contacts can be deleted at any time (right to erasure). Data is stored locally.
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link to="/" className="btn-primary">View Dashboard</Link>
        <Link to="/triggers/new" className="btn-ghost">Add Trigger</Link>
      </div>
    </div>
  );
}
