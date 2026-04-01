// ── localStorage-based store (no backend needed) ──────────────────────────────
// Mirrors the exact same API surface as the original REST api.js

const KEYS = {
  triggers: 'pharma_bd_triggers',
  contacts: 'pharma_bd_contacts',
  outreach: 'pharma_bd_outreach',
};

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Seed data (loaded once on first visit) ────────────────────────────────────
const SEED_TRIGGERS = [
  {
    id: 'seed-001',
    type: 'ema_approval',
    title: 'Datopotamab deruxtecan — NSCLC 2nd line',
    description:
      'CHMP positive opinion for datopotamab deruxtecan (Datroway) in previously treated advanced non-small cell lung cancer. AstraZeneca / Daiichi Sankyo co-development. Belgian affiliate has 12–18 months to prepare local launch strategy.',
    company: 'AstraZeneca',
    company_be: 'AstraZeneca Belgium',
    company_domain: 'astrazeneca.com',
    therapeutic_area: 'Oncology — Lung',
    urgency: 'high',
    source_name: 'EMA — CHMP Positive Opinion',
    source_url: 'https://www.ema.europa.eu/en/medicines/human/EPAR/datroway',
    suggested_roles: ['Brand Manager', 'Market Access Manager', 'Medical Advisor'],
    detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'seed-002',
    type: 'riziv_decision',
    title: 'Trastuzumab deruxtecan — HER2+ Breast Cancer reimbursement dossier',
    description:
      'Daiichi Sankyo Belgium submitted reimbursement dossier for T-DXd (Enhertu) in HER2-positive metastatic breast cancer to CTG/CRM. Decision expected within 6 months. Affiliate urgently needs prescriber readiness research and positioning data for Belgian oncologists.',
    company: 'Daiichi Sankyo',
    company_be: 'Daiichi Sankyo Belgium',
    company_domain: 'daiichi-sankyo.com',
    therapeutic_area: 'Oncology — Breast',
    urgency: 'high',
    source_name: 'RIZIV/INAMI — CTG Dossier Submitted',
    source_url: 'https://www.riziv.fgov.be/nl/themas/kost-terugbetaling/door-ziekenfonds/geneesmiddel-gezondheidsproduct/terugbetalen/specialiteiten/wijzigingen',
    suggested_roles: ['Market Access Manager', 'Brand Manager', 'Medical Advisor'],
    detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'seed-003',
    type: 'kce_guideline',
    title: 'KCE Guideline Update — Heart Failure Management 2025',
    description:
      'KCE published updated clinical guidelines for heart failure management, incorporating new evidence for SGLT2 inhibitors and new biomarker thresholds. Affects Boehringer Ingelheim (empagliflozin), AstraZeneca (dapagliflozin), Novartis (sacubitril/valsartan). Prescribers need to be surveyed on adoption intent and barriers.',
    company: 'Boehringer Ingelheim',
    company_be: 'Boehringer Ingelheim Belgium',
    company_domain: 'boehringer-ingelheim.com',
    therapeutic_area: 'Cardiovascular — Heart Failure',
    urgency: 'medium',
    source_name: 'KCE — Clinical Practice Guideline',
    source_url: 'https://www.kce.fgov.be/en/publications/all-reports',
    suggested_roles: ['Medical Advisor', 'Brand Manager', 'Customer Insights Manager'],
    detected_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'seed-004',
    type: 'clinical_trial',
    title: 'Tirzepatide — MASH/NASH Phase III (Belgian sites active)',
    description:
      'Eli Lilly SURMOUNT-NASH Phase III trial for tirzepatide in metabolic dysfunction-associated steatohepatitis (MASH) now has active Belgian sites (UZ Leuven, UZ Gent, CHU Liège). If results are positive, Belgian launch in 18–24 months. Early landscaping research opportunity — hepatologist mapping, treatment pathway, patient journey.',
    company: 'Eli Lilly',
    company_be: 'Eli Lilly Belgium',
    company_domain: 'lilly.com',
    therapeutic_area: 'Metabolic — Liver Disease',
    urgency: 'early_signal',
    source_name: 'ClinicalTrials.gov — Phase III Recruiting',
    source_url: 'https://clinicaltrials.gov/search?locStr=Belgium&country=Belgium&phase=PHASE3&term=tirzepatide',
    suggested_roles: ['Medical Advisor', 'Brand Manager', 'BU Director'],
    detected_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: 'seed-005',
    type: 'vacancy_signal',
    title: 'Brand Manager — Respiratory Franchise vacancy',
    description:
      'Boehringer Ingelheim Belgium posting for Brand Manager Respiratory (Dupixent competitor space / COPD). Active hiring signals strategic investment in the respiratory franchise — likely a new indication launch or major campaign. Competitor awareness research and prescriber sentiment studies will be needed.',
    company: 'Boehringer Ingelheim',
    company_be: 'Boehringer Ingelheim Belgium',
    company_domain: 'boehringer-ingelheim.com',
    therapeutic_area: 'Respiratory',
    urgency: 'medium',
    source_name: 'LinkedIn Jobs — Belgium',
    source_url: 'https://www.linkedin.com/jobs/search/?keywords=brand+manager+respiratory+pharmaceutical&location=Belgium',
    suggested_roles: ['BU Director', 'Customer Insights Manager', 'Head of Marketing'],
    detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
];

// ── Storage helpers ───────────────────────────────────────────────────────────
function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initStore() {
  if (!load(KEYS.triggers)) {
    save(KEYS.triggers, SEED_TRIGGERS);
  }
  if (!load(KEYS.contacts)) save(KEYS.contacts, []);
  if (!load(KEYS.outreach)) save(KEYS.outreach, []);
}

initStore();

// ── Triggers ──────────────────────────────────────────────────────────────────
export function getTriggers(params = {}) {
  let rows = load(KEYS.triggers) || [];
  if (params.type)    rows = rows.filter(t => t.type === params.type);
  if (params.urgency) rows = rows.filter(t => t.urgency === params.urgency);
  if (params.status)  rows = rows.filter(t => t.status === params.status);
  return Promise.resolve(rows);
}

export function getTrigger(id) {
  const trigger = (load(KEYS.triggers) || []).find(t => t.id === id);
  if (!trigger) return Promise.reject(new Error('Trigger not found'));
  const contacts = (load(KEYS.contacts) || []).filter(c => c.trigger_id === id);
  return Promise.resolve({ ...trigger, contacts });
}

export function createTrigger(data) {
  const triggers = load(KEYS.triggers) || [];
  const record = {
    ...data,
    id: uid(),
    status: data.status || 'new',
    detected_at: new Date().toISOString(),
    suggested_roles: Array.isArray(data.suggested_roles) ? data.suggested_roles : [],
  };
  save(KEYS.triggers, [record, ...triggers]);
  return Promise.resolve(record);
}

export function updateTrigger(id, data) {
  const triggers = load(KEYS.triggers) || [];
  const idx = triggers.findIndex(t => t.id === id);
  if (idx === -1) return Promise.reject(new Error('Trigger not found'));
  triggers[idx] = { ...triggers[idx], ...data };
  save(KEYS.triggers, triggers);
  return Promise.resolve(triggers[idx]);
}

export function deleteTrigger(id) {
  save(KEYS.triggers, (load(KEYS.triggers) || []).filter(t => t.id !== id));
  return Promise.resolve({ ok: true });
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export function getContacts(triggerId) {
  const contacts = (load(KEYS.contacts) || []).filter(c => c.trigger_id === triggerId);
  return Promise.resolve(contacts);
}

export function createContact(data) {
  const contacts = load(KEYS.contacts) || [];
  const record = { ...data, id: uid(), created_at: new Date().toISOString() };
  save(KEYS.contacts, [record, ...contacts]);
  return Promise.resolve(record);
}

export function updateContact(id, data) {
  const contacts = load(KEYS.contacts) || [];
  const idx = contacts.findIndex(c => c.id === id);
  if (idx === -1) return Promise.reject(new Error('Contact not found'));
  contacts[idx] = { ...contacts[idx], ...data };
  save(KEYS.contacts, contacts);
  return Promise.resolve(contacts[idx]);
}

export function deleteContact(id) {
  save(KEYS.contacts, (load(KEYS.contacts) || []).filter(c => c.id !== id));
  return Promise.resolve({ ok: true });
}

// ── Outreach ──────────────────────────────────────────────────────────────────
export function getOutreach(contactId) {
  const rows = (load(KEYS.outreach) || []).filter(o => o.contact_id === contactId);
  return Promise.resolve(rows);
}

export function logOutreach(data) {
  const rows = load(KEYS.outreach) || [];
  const record = { ...data, id: uid(), sent_at: new Date().toISOString(), response_status: 'pending' };
  save(KEYS.outreach, [record, ...rows]);
  return Promise.resolve(record);
}

export function updateOutreachStatus(id, response_status) {
  const rows = load(KEYS.outreach) || [];
  const idx = rows.findIndex(o => o.id === id);
  if (idx === -1) return Promise.reject(new Error('Outreach not found'));
  rows[idx] = { ...rows[idx], response_status };
  save(KEYS.outreach, rows);
  return Promise.resolve(rows[idx]);
}
