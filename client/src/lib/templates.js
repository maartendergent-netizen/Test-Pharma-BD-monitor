// Extract product name and indication from trigger title (format: "Product — Indication")
function parseTitle(trigger) {
  const parts = trigger.title.split(' — ');
  return {
    product: parts[0]?.trim() || trigger.title,
    indication: parts[1]?.trim() || trigger.therapeutic_area || '',
  };
}

function firstName(contact) {
  return contact.name.split(' ')[0];
}

// ── EMA Approval ──────────────────────────────────────────────────────────────
function emaTemplates(trigger, contact) {
  const { product, indication } = parseTitle(trigger);
  const name = firstName(contact);
  const company = trigger.company_be || trigger.company || 'your company';

  return {
    linkedin: `Hi ${name}, I noticed ${company} recently received a positive CHMP opinion for ${product}${indication ? ` in ${indication}` : ''}. At Ipsos Healthcare Belgium, we regularly support pharma affiliates with qualitative pre-launch research among Belgian specialists (in Dutch and French). Would love to connect and explore how we might help as you prepare for the Belgian launch.`,
    email: {
      subject: `${product} in Belgium — local specialist perspectives`,
      body: `Dear ${name},

I saw the positive CHMP opinion for ${product}${indication ? ` in ${indication}` : ''} — an exciting milestone.

As a Senior Research Consultant at Ipsos Healthcare Belgium, I work with pharma teams preparing for local launches. We specialise in qualitative research with Belgian specialists in Dutch and French.

For ${product}, we could help with:
• Pre-launch perception mapping among Belgian ${indication ? indication.split(' ')[0].toLowerCase() : 'specialist'}s
• Positioning & messaging validation
• KOL identification and advisory board set-up

Would a 20-minute call be useful?

Best regards,
Maarten
Senior Research Consultant — Ipsos Healthcare Belgium`,
    },
    call: `Hi ${name}, this is Maarten from Ipsos Healthcare Belgium. I saw the positive CHMP opinion for ${product}. I wanted to check whether you're looking into qualitative research with Belgian specialists for the local launch — we could quickly set up explorative conversations in Dutch and French. Would it make sense to schedule a short call this week?`,
  };
}

// ── RIZIV/INAMI Decision ──────────────────────────────────────────────────────
function rizivTemplates(trigger, contact) {
  const { product, indication } = parseTitle(trigger);
  const name = firstName(contact);
  const company = trigger.company_be || trigger.company || 'your company';

  return {
    linkedin: `Hi ${name}, I noticed ${company} has a reimbursement dossier pending at CTG/CRM for ${product}. At Ipsos Healthcare Belgium, we help pharma teams with prescriber readiness research and payer advisory boards — exactly what's needed ahead of a reimbursement decision. Would love to connect.`,
    email: {
      subject: `${product} reimbursement — Belgian prescriber readiness research`,
      body: `Dear ${name},

I noticed the CTG/CRM reimbursement dossier for ${product}${indication ? ` in ${indication}` : ''} — a key milestone for ${company}.

Ahead of a reimbursement decision, affiliates often need to understand:
• Belgian prescriber adoption intent and barriers
• Payer and specialist perception of the value dossier
• Optimal positioning vs. reimbursed alternatives

At Ipsos Healthcare Belgium, we conduct these studies with Belgian specialists (Dutch and French). We've supported multiple market access teams through CTG processes.

Would a 20-minute call to explore how we can help make sense?

Best regards,
Maarten
Senior Research Consultant — Ipsos Healthcare Belgium`,
    },
    call: `Hi ${name}, this is Maarten from Ipsos Healthcare Belgium. I saw the reimbursement dossier for ${product} is pending at CTG. We work with pharma teams on prescriber readiness and payer insight studies at exactly this stage of the process. Is this something you're currently working on? I'd love to have a quick chat.`,
  };
}

// ── KCE Guideline ─────────────────────────────────────────────────────────────
function kceTemplates(trigger, contact) {
  const { product } = parseTitle(trigger);
  const name = firstName(contact);
  const area = trigger.therapeutic_area || 'your therapeutic area';

  return {
    linkedin: `Hi ${name}, I saw the new KCE guideline on ${area}. These updates often change prescriber behaviour significantly — and affiliates need fast, qualitative insight on how Belgian specialists are responding. At Ipsos Healthcare Belgium, we run exactly these kinds of rapid reaction studies. Would love to connect.`,
    email: {
      subject: `New KCE guideline — Belgian prescriber reaction study`,
      body: `Dear ${name},

The new KCE guideline on ${area} has just been published — these updates typically reshape prescriber decision-making and create real urgency to understand local response.

At Ipsos Healthcare Belgium, we can help with:
• Rapid reaction research: how Belgian specialists are interpreting the guideline
• Messaging update validation based on new clinical recommendations
• Competitive landscape assessment post-guideline

We work in Dutch and French with specialists across Belgium.

Would a 20-minute call to explore this be useful?

Best regards,
Maarten
Senior Research Consultant — Ipsos Healthcare Belgium`,
    },
    call: `Hi ${name}, this is Maarten from Ipsos Healthcare Belgium. I wanted to reach out about the new KCE guideline on ${area}. We help pharma affiliates understand how Belgian specialists are reacting to these updates — through qualitative interviews in Dutch and French. Is this something your team is looking into? I'd love a quick conversation.`,
  };
}

// ── Clinical Trial ────────────────────────────────────────────────────────────
function trialTemplates(trigger, contact) {
  const { product, indication } = parseTitle(trigger);
  const name = firstName(contact);
  const company = trigger.company_be || trigger.company || 'your company';

  return {
    linkedin: `Hi ${name}, I noticed the Phase III trial for ${product}${indication ? ` in ${indication}` : ''} has active Belgian sites. This is typically the right moment to start early landscaping research with Belgian specialists — to map the treatment pathway and identify future KOLs. At Ipsos Healthcare Belgium, we specialise in exactly this. Would love to connect.`,
    email: {
      subject: `${product} Phase III — early landscaping research in Belgium`,
      body: `Dear ${name},

I saw that the Phase III trial for ${product}${indication ? ` in ${indication}` : ''} now has active Belgian sites — which signals a potential Belgian launch in the next 18–24 months.

This is the ideal moment to start early-stage landscaping research:
• Current treatment pathway and unmet need mapping
• KOL identification across Belgian sites (UZ Leuven, UZ Gent, UZ Brussel, CHU Liège…)
• Specialist awareness and early perceptions of the compound
• Patient journey in Belgian clinical practice

Ipsos Healthcare Belgium specialises in qualitative research with Belgian specialists in Dutch and French. We can move quickly and work confidentially.

Would a 20-minute call to discuss this be useful?

Best regards,
Maarten
Senior Research Consultant — Ipsos Healthcare Belgium`,
    },
    call: `Hi ${name}, this is Maarten from Ipsos Healthcare Belgium. I noticed the Phase III trial for ${product} has active Belgian sites. We help pharma teams with early landscaping research at this stage — specialist mapping, treatment pathway insights, KOL identification. Is that something ${company} is thinking about? Would love to schedule a short call.`,
  };
}

// ── Vacancy Signal ────────────────────────────────────────────────────────────
function vacancyTemplates(trigger, contact) {
  const { product } = parseTitle(trigger);
  const name = firstName(contact);
  const company = trigger.company_be || trigger.company || 'your company';
  const area = trigger.therapeutic_area || 'this area';

  return {
    linkedin: `Hi ${name}, I noticed ${company} is actively hiring in ${area} — which signals real strategic investment in the franchise. At Ipsos Healthcare Belgium, we partner with local pharma teams on market research for launches and campaigns. I'd love to connect and introduce ourselves as a potential research partner.`,
    email: {
      subject: `${company} — ${area} research partnership`,
      body: `Dear ${name},

I noticed ${company} is growing its ${area} team in Belgium — which usually signals an exciting period ahead, whether it's a new indication, a product launch, or a major campaign.

At Ipsos Healthcare Belgium, we work with franchise teams at a strategic moment like this to provide:
• Prescriber landscape and positioning research
• Competitive intelligence through qualitative specialist interviews
• Brand tracking and message testing in Dutch and French
• KOL advisory boards and expert panel facilitation

We've worked with most major pharma affiliates in Belgium and understand the local market well.

Would it make sense to have a quick introductory call — even just to put us on your radar for future projects?

Best regards,
Maarten
Senior Research Consultant — Ipsos Healthcare Belgium`,
    },
    call: `Hi ${name}, this is Maarten from Ipsos Healthcare Belgium. I saw that ${company} is hiring for ${area} — I wanted to reach out to introduce Ipsos as a research partner for Belgian qualitative studies. We do prescriber interviews, focus groups, and advisory boards in Dutch and French. Would it make sense to have a quick intro call?`,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateOutreach(trigger, contact) {
  switch (trigger.type) {
    case 'ema_approval':    return emaTemplates(trigger, contact);
    case 'riziv_decision':  return rizivTemplates(trigger, contact);
    case 'kce_guideline':   return kceTemplates(trigger, contact);
    case 'clinical_trial':  return trialTemplates(trigger, contact);
    case 'vacancy_signal':  return vacancyTemplates(trigger, contact);
    default:                return emaTemplates(trigger, contact);
  }
}
