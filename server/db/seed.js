import { getDb } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const triggers = [
  {
    id: uuidv4(),
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
    source_url:
      'https://www.ema.europa.eu/en/medicines/human/EPAR/datroway',
    suggested_roles: JSON.stringify([
      'Brand Manager',
      'Market Access Manager',
      'Medical Advisor',
    ]),
    detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: uuidv4(),
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
    source_url:
      'https://www.riziv.fgov.be/nl/themas/kost-terugbetaling/door-ziekenfonds/geneesmiddel-gezondheidsproduct/terugbetalen/specialiteiten/wijzigingen',
    suggested_roles: JSON.stringify([
      'Market Access Manager',
      'Brand Manager',
      'Medical Advisor',
    ]),
    detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: uuidv4(),
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
    suggested_roles: JSON.stringify([
      'Medical Advisor',
      'Brand Manager',
      'Customer Insights Manager',
    ]),
    detected_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: uuidv4(),
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
    source_url:
      'https://clinicaltrials.gov/search?locStr=Belgium&country=Belgium&phase=PHASE3&term=tirzepatide',
    suggested_roles: JSON.stringify([
      'Medical Advisor',
      'Brand Manager',
      'BU Director',
    ]),
    detected_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
  {
    id: uuidv4(),
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
    source_url:
      'https://www.linkedin.com/jobs/search/?keywords=brand+manager+respiratory+pharmaceutical&location=Belgium',
    suggested_roles: JSON.stringify([
      'BU Director',
      'Customer Insights Manager',
      'Head of Marketing',
    ]),
    detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
  },
];

const db = getDb();

const existing = db.prepare('SELECT COUNT(*) as count FROM triggers').get();
if (existing.count > 0) {
  console.log(`Database already has ${existing.count} triggers. Skipping seed.`);
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO triggers (id, type, title, description, company, company_be, company_domain, therapeutic_area, urgency, source_name, source_url, suggested_roles, detected_at, status)
  VALUES (@id, @type, @title, @description, @company, @company_be, @company_domain, @therapeutic_area, @urgency, @source_name, @source_url, @suggested_roles, @detected_at, @status)
`);

const seedMany = db.transaction((items) => {
  for (const item of items) insert.run(item);
});

seedMany(triggers);
console.log(`Seeded ${triggers.length} triggers into database.`);
