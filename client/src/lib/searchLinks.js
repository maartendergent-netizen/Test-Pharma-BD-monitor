export function generateSearchLinks(role, company, domain) {
  const q = encodeURIComponent(`${role} ${company} Belgium`);
  const roleQ = encodeURIComponent(role);
  const companyQ = encodeURIComponent(company);

  return [
    {
      id: 'linkedin',
      label: 'LinkedIn Search',
      description: 'Free people search',
      free: true,
      url: `https://www.linkedin.com/search/results/people/?keywords=${q}`,
      color: 'blue',
    },
    {
      id: 'salesnav',
      label: 'Sales Navigator',
      description: 'Advanced B2B filtering',
      free: false,
      url: `https://www.linkedin.com/sales/search/people?keywords=${q}`,
      color: 'blue',
    },
    {
      id: 'apollo',
      label: 'Apollo.io',
      description: 'Verified B2B emails',
      free: false,
      url: `https://app.apollo.io/#/people?qKeywords=${roleQ}&qOrganizationName=${companyQ}&prospectedByCurrentTeam[]=no`,
      color: 'orange',
    },
    {
      id: 'hunter',
      label: 'Hunter.io',
      description: `Email patterns @${domain}`,
      free: true,
      url: `https://hunter.io/search/${domain}`,
      color: 'amber',
    },
  ];
}

export const PHARMA_COMPANIES = [
  { name: 'AstraZeneca', be: 'AstraZeneca Belgium', domain: 'astrazeneca.com' },
  { name: 'Boehringer Ingelheim', be: 'Boehringer Ingelheim Belgium', domain: 'boehringer-ingelheim.com' },
  { name: 'MSD', be: 'MSD Belgium', domain: 'msd.com' },
  { name: 'Novartis', be: 'Novartis Belgium', domain: 'novartis.com' },
  { name: 'Pfizer', be: 'Pfizer Belgium', domain: 'pfizer.com' },
  { name: 'GSK', be: 'GSK Belgium', domain: 'gsk.com' },
  { name: 'Eli Lilly', be: 'Eli Lilly Belgium', domain: 'lilly.com' },
  { name: 'Servier', be: 'Servier Belgium', domain: 'servier.com' },
  { name: 'Ipsen', be: 'Ipsen Belgium', domain: 'ipsen.com' },
  { name: 'Daiichi Sankyo', be: 'Daiichi Sankyo Belgium', domain: 'daiichi-sankyo.com' },
  { name: 'Roche', be: 'Roche Belgium', domain: 'roche.com' },
  { name: 'Sanofi', be: 'Sanofi Belgium', domain: 'sanofi.com' },
  { name: 'Amgen', be: 'Amgen Belgium', domain: 'amgen.com' },
  { name: 'Janssen', be: 'Janssen Belgium', domain: 'janssen.com' },
  { name: 'BMS', be: 'BMS Belgium', domain: 'bms.com' },
  { name: 'AbbVie', be: 'AbbVie Belgium', domain: 'abbvie.com' },
  { name: 'Takeda', be: 'Takeda Belgium', domain: 'takeda.com' },
];

export const TRIGGER_ROLES = {
  ema_approval: ['Brand Manager', 'Market Access Manager', 'Medical Advisor'],
  riziv_decision: ['Market Access Manager', 'Brand Manager', 'Medical Advisor'],
  kce_guideline: ['Medical Advisor', 'Brand Manager', 'Customer Insights Manager'],
  clinical_trial: ['Medical Advisor', 'Brand Manager', 'BU Director'],
  vacancy_signal: ['BU Director', 'Customer Insights Manager', 'Head of Marketing'],
};
