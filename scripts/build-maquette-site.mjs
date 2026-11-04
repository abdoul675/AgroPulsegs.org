import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const indexPath = path.join(publicRoot, 'index.html');
const imageDirectory = path.join(publicRoot, 'assets', 'maquette');
let html = await readFile(indexPath, 'utf8');
for (const link of [
  '<a data-en="Qualified Digital Human Resources" href="#p-pole-7">Ressources humaines numériques</a>',
  '<a data-en="Agricultural Mechanisation" href="#p-pole-8">Mécanisation agricole</a>',
  '<a data-en="Apply" href="#p-candidature">Candidater</a>',
]) {
  html = html.replace(link, '');
}

await mkdir(imageDirectory, { recursive: true });
const imageFiles = new Map();
html = html.replace(/data:(image\/(webp|png));base64,([A-Za-z0-9+/=]+)/gu, (source, mime, extension, encoded) => {
  const contents = Buffer.from(encoded, 'base64');
  const filename = `${createHash('sha256').update(contents).digest('hex').slice(0, 20)}.${extension}`;
  if (!imageFiles.has(filename)) imageFiles.set(filename, contents);
  return `assets/maquette/${filename}`;
});
for (const [filename, contents] of imageFiles) {
  const imagePath = path.join(imageDirectory, filename);
  try {
    await access(imagePath);
  } catch {
    await writeFile(imagePath, contents);
  }
}

const dataPattern = /(<script id="pages-data" type="application\/json">)([\s\S]*?)(<\/script>)/u;
const dataMatch = html.match(dataPattern);
if (!dataMatch) throw new Error('The design page is missing its page-content data.');
const pages = JSON.parse(dataMatch[2]);
const localized = (fr, en) => ({ fr, en });
const paragraphs = (fr, en) => [localized(fr, en)];
const getSection = (page, id) => {
  const section = page.sections?.find(item => item.id === id);
  if (!section) throw new Error(`Missing section "${id}" in page "${page.slug}".`);
  return section;
};
const setGroup = (group, item) => {
  group.title = localized(item.titleFr, item.titleEn);
  group.text = paragraphs(item.textFr, item.textEn);
  if (item.href) group.to = item.href;
  else delete group.to;
};
const setGroups = (section, items) => {
  const existing = section.groups || [];
  section.groups = items.map((item, index) => {
    const group = { ...(existing[index] || {}) };
    setGroup(group, item);
    return group;
  });
};

const expertise = [
  {
    titleFr: 'Formation, emploi et talents numériques',
    titleEn: 'Digital training, employment and talent',
    textFr: 'Formation, certification, placement et renforcement des capacités numériques.',
    textEn: 'Training, certification, placement and digital capacity building.',
  },
  {
    titleFr: 'SI agricoles et gouvernance des données',
    titleEn: 'Agricultural information systems and data governance',
    textFr: 'Diagnostic, cartographie, applications, portails et politiques de gouvernance des données.',
    textEn: 'Diagnostics, data mapping, applications, portals and data governance policies.',
  },
  {
    titleFr: 'IA et Data Analytics',
    titleEn: 'AI and data analytics',
    textFr: 'Prévisions de prix et de rendements, aide à la décision, tableaux de bord et publications.',
    textEn: 'Price and yield forecasting, decision support, dashboards and publications.',
  },
  {
    titleFr: 'Climat, économie verte et finance climatique',
    titleEn: 'Climate, green economy and climate finance',
    textFr: 'Mesure, carbone, ESG, traçabilité, finance verte, risques et adaptation.',
    textEn: 'Measurement, carbon, ESG, traceability, green finance, risks and adaptation.',
  },
  {
    titleFr: 'Incubation et startups agri-tech',
    titleEn: 'Agri-tech incubation and startups',
    textFr: 'Modèles d’affaires, incubation, accélération, mentorat et mise en relation.',
    textEn: 'Business models, incubation, acceleration, mentoring and connections.',
  },
  {
    titleFr: 'Conseil stratégique, études et mécanisation',
    titleEn: 'Strategic consulting, studies and mechanization',
    textFr: 'Diagnostics, faisabilité, politiques de digitalisation, études de marché et mécanisation.',
    textEn: 'Diagnostics, feasibility, digitalization policies, market studies and mechanization.',
  },
].map((item, index) => ({ ...item, href: `#p-pole-${index + 1}` }));

const expertiseDetails = [
  [
    { titleFr: 'Formation numérique', titleEn: 'Digital training', textFr: 'Formation et renforcement des capacités numériques.', textEn: 'Digital training and capacity building.' },
    { titleFr: 'Certification et placement', titleEn: 'Certification and placement', textFr: 'Certification et placement de talents numériques.', textEn: 'Certification and placement of digital talent.' },
  ],
  [
    { titleFr: 'Diagnostic et cartographie', titleEn: 'Diagnostics and mapping', textFr: 'Diagnostic des systèmes d’information et cartographie des données agricoles.', textEn: 'Information-system diagnostics and mapping of agricultural data.' },
    { titleFr: 'Applications et portails', titleEn: 'Applications and portals', textFr: 'Applications, portails et gouvernance des données.', textEn: 'Applications, portals and data governance.' },
  ],
  [
    { titleFr: 'Prévisions', titleEn: 'Forecasting', textFr: 'Prévisions de prix et de rendements agricoles.', textEn: 'Price and agricultural yield forecasting.' },
    { titleFr: 'Aide à la décision', titleEn: 'Decision support', textFr: 'Outils d’aide à la décision, tableaux de bord et publications.', textEn: 'Decision-support tools, dashboards and publications.' },
  ],
  [
    { titleFr: 'Mesure et traçabilité', titleEn: 'Measurement and traceability', textFr: 'Mesure, carbone, ESG et traçabilité.', textEn: 'Measurement, carbon, ESG and traceability.' },
    { titleFr: 'Finance et adaptation', titleEn: 'Finance and adaptation', textFr: 'Finance verte, risques climatiques et adaptation.', textEn: 'Green finance, climate risks and adaptation.' },
  ],
  [
    { titleFr: 'Incubation et accélération', titleEn: 'Incubation and acceleration', textFr: 'Modèles d’affaires, incubation et accélération de startups agri-tech.', textEn: 'Business models, incubation and acceleration for agri-tech startups.' },
    { titleFr: 'Mentorat et mise en relation', titleEn: 'Mentoring and connections', textFr: 'Mentorat et mise en relation.', textEn: 'Mentoring and connections.' },
  ],
  [
    { titleFr: 'Conseil et études', titleEn: 'Consulting and studies', textFr: 'Diagnostics, études de faisabilité et études de marché.', textEn: 'Diagnostics, feasibility studies and market studies.' },
    { titleFr: 'Digitalisation et mécanisation', titleEn: 'Digitalisation and mechanization', textFr: 'Politiques de digitalisation et mécanisation agricole.', textEn: 'Digitalisation policies and agricultural mechanization.' },
  ],
];

expertise.forEach((item, index) => {
  const page = pages[`pole-${index + 1}`];
  if (!page) throw new Error(`Missing expertise page "pole-${index + 1}" in the design page.`);
  page.hero.title = localized(item.titleFr, item.titleEn);
  page.hero.lead = paragraphs(item.textFr, item.textEn);
  const details = getSection(page, 'faire');
  details.title = localized('Nos domaines d’expertise', 'Our areas of expertise');
  setGroups(details, expertiseDetails[index]);
});

for (const pageName of ['accueil', 'expertises']) {
  const page = pages[pageName];
  if (!page) throw new Error(`Missing page "${pageName}" in the design page.`);
  const section = page.sections.find(item => item.type === 'acc6');
  if (!section) throw new Error(`Missing expertise cards in page "${pageName}".`);
  section.title = localized('Six pôles complémentaires', 'Six complementary areas of expertise');
  section.lead = paragraphs(
    'Des compétences en formation, données, climat, innovation et conseil stratégique pour les filières agricoles.',
    'Expertise in training, data, climate, innovation and strategic consulting for agricultural value chains.',
  );
  setGroups(section, expertise);
}

const home = pages.accueil;
if (!home) throw new Error('Missing Home page in the design page.');
const homeYida = getSection(home, 'fellowship');
homeYida.title = localized('YIDA-Cashew · Fellowship', 'YIDA-Cashew · Fellowship');
homeYida.lead = paragraphs(
  'Un parcours de formation de 2 à 3 mois autour des données agricoles. Les candidatures sont fermées ; le calendrier et les critères restent à confirmer.',
  'A two-to-three-month training program focused on agricultural data. Applications are closed; schedule and criteria are to be confirmed.',
);
setGroups(homeYida, [
  { titleFr: 'Durée : 2 à 3 mois', titleEn: 'Duration: 2 to 3 months', textFr: 'Un parcours consacré aux données agricoles.', textEn: 'A program focused on agricultural data.' },
  { titleFr: 'Candidatures fermées', titleEn: 'Applications closed', textFr: 'Le calendrier et les critères restent à confirmer.', textEn: 'The schedule and criteria are to be confirmed.' },
]);
homeYida.button = localized('En savoir plus sur YIDA-Cashew', 'Learn more about YIDA-Cashew');

const expertisePage = pages.expertises;
if (!expertisePage) throw new Error('Missing Expertise page in the design page.');
expertisePage.hero.title = localized('Six pôles d’expertise', 'Six areas of expertise');
expertisePage.hero.lead = paragraphs(
  'Six domaines complémentaires au service des filières agricoles.',
  'Six complementary areas supporting agricultural value chains.',
);

const about = pages['a-propos'];
if (!about) throw new Error('Missing About page in the design page.');
about.hero.lead = paragraphs(
  'AgroPulse Global Solutions accompagne les filières agricoles avec du conseil, des systèmes d’information et des services numériques.',
  'AgroPulse Global Solutions supports agricultural value chains through consulting, information systems and digital services.',
);
const identity = getSection(about, 'identite');
identity.title = localized('Qui sommes-nous ?', 'Who we are');
identity.lead = paragraphs(
  'AgroPulse Global Solutions accompagne la transformation numérique et verte des filières agricoles.',
  'AgroPulse Global Solutions supports the digital and green transformation of agricultural value chains.',
);
const mission = getSection(about, 'mission');
setGroups(mission, [
  {
    titleFr: 'Notre rôle',
    titleEn: 'Our role',
    textFr: 'Mettre le conseil, les systèmes d’information et les services numériques au service des filières agricoles.',
    textEn: 'Use consulting, information systems and digital services to support agricultural value chains.',
  },
  {
    titleFr: 'Notre approche',
    titleEn: 'Our approach',
    textFr: 'Relier les besoins de terrain, les données et les compétences pour accompagner des projets agricoles.',
    textEn: 'Connect field needs, data and skills to support agricultural projects.',
  },
]);
const team = getSection(about, 'equipe');
team.title = localized('Une équipe au service des filières', 'A team supporting value chains');
team.lead = paragraphs(
  'AgroPulse mobilise des compétences en agriculture, données et services numériques selon les besoins des projets.',
  'AgroPulse brings together agricultural, data and digital service expertise according to project needs.',
);
setGroups(team, [{
  titleFr: 'AgroPulse Global Solutions',
  titleEn: 'AgroPulse Global Solutions',
  textFr: 'Conseil et solutions numériques pour les acteurs des filières agricoles.',
  textEn: 'Consulting and digital solutions for agricultural value-chain stakeholders.',
}]);
const aboutFacts = getSection(about, 'impact');
aboutFacts.title = localized('Repères AgroPulse', 'AgroPulse at a glance');
aboutFacts.lead = paragraphs(
  'Les informations validées présentent six pôles d’expertise et des pays d’intervention en Afrique de l’Ouest.',
  'Validated information identifies six areas of expertise and countries of operation in West Africa.',
);
setGroups(aboutFacts, [
  {
    titleFr: '6 pôles d’expertise',
    titleEn: '6 areas of expertise',
    textFr: 'Formation, systèmes d’information, IA et données, climat, incubation et conseil.',
    textEn: 'Training, information systems, AI and data, climate, incubation and consulting.',
  },
  {
    titleFr: 'Côte d’Ivoire · Sénégal · Guinée-Bissau',
    titleEn: 'Côte d’Ivoire · Senegal · Guinea-Bissau',
    textFr: 'Pays d’intervention indiqués dans les informations AgroPulse.',
    textEn: 'Countries of operation listed in AgroPulse information.',
  },
  {
    titleFr: 'YIDA-Cashew et AGIR-IA',
    titleEn: 'YIDA-Cashew and AGIR-IA',
    textFr: 'Deux programmes distincts.',
    textEn: 'Two distinct programs.',
  },
]);

const yida = pages.fellowship;
if (!yida) throw new Error('Missing YIDA-Cashew page in the design page.');
yida.hero.title = localized('YIDA-Cashew · Fellowship', 'YIDA-Cashew · Fellowship');
yida.hero.lead = paragraphs(
  'Un parcours de formation de 2 à 3 mois autour des données agricoles. Les candidatures sont fermées ; le calendrier et les critères restent à confirmer.',
  'A two-to-three-month training program focused on agricultural data. Applications are closed; schedule and criteria are to be confirmed.',
);
const yidaOrigin = getSection(yida, 'genese');
yidaOrigin.title = localized('Se former aux données agricoles', 'Training in agricultural data');
yidaOrigin.lead = paragraphs(
  'Le Fellowship YIDA-Cashew vise le développement de compétences numériques appliquées aux filières agricoles.',
  'The YIDA-Cashew Fellowship focuses on developing digital skills for agricultural value chains.',
);
setGroups(yidaOrigin, [
  {
    titleFr: 'Se former',
    titleEn: 'Build skills',
    textFr: 'Un parcours de 2 à 3 mois consacré aux données agricoles.',
    textEn: 'A two-to-three-month program focused on agricultural data.',
  },
  {
    titleFr: 'Se préparer',
    titleEn: 'Prepare',
    textFr: 'Le programme mentionne un accompagnement vers l’emploi, sans garantie d’embauche.',
    textEn: 'The program mentions employment support, without a job guarantee.',
  },
]);
const yidaJourney = getSection(yida, 'parcours');
yidaJourney.title = localized('Un parcours de formation', 'A training program');
yidaJourney.lead = paragraphs(
  'La durée indiquée est de 2 à 3 mois. Les dates et les critères de candidature restent à confirmer.',
  'The stated duration is two to three months. Application dates and criteria are to be confirmed.',
);
setGroups(yidaJourney, [
  { titleFr: 'Se former', titleEn: 'Learn', textFr: 'Développer des compétences autour des données agricoles.', textEn: 'Develop skills in agricultural data.' },
  { titleFr: 'Mettre en pratique', titleEn: 'Practice', textFr: 'Appliquer les apprentissages aux besoins des filières agricoles.', textEn: 'Apply learning to agricultural value-chain needs.' },
  { titleFr: 'Préparer la suite', titleEn: 'Plan next steps', textFr: 'Un accompagnement vers l’emploi est mentionné, sans garantie d’embauche.', textEn: 'Employment support is mentioned, with no job guarantee.' },
]);
const yidaLearn = getSection(yida, 'appris');
yidaLearn.title = localized('Informations clés', 'Key information');
yidaLearn.lead = paragraphs(
  'Les candidatures sont fermées. Le calendrier et les critères seront communiqués après confirmation.',
  'Applications are closed. The schedule and criteria will be shared once confirmed.',
);
setGroups(yidaLearn, [
  { titleFr: 'Durée', titleEn: 'Duration', textFr: '2 à 3 mois de formation.', textEn: 'Two to three months of training.' },
  { titleFr: 'Candidatures', titleEn: 'Applications', textFr: 'Fermées actuellement.', textEn: 'Currently closed.' },
  { titleFr: 'Calendrier', titleEn: 'Schedule', textFr: 'À confirmer.', textEn: 'To be confirmed.' },
  { titleFr: 'Critères', titleEn: 'Criteria', textFr: 'À confirmer.', textEn: 'To be confirmed.' },
]);
const yidaBand = getSection(yida, 'anacarde');
yidaBand.title = localized('YIDA-Cashew', 'YIDA-Cashew');
yidaBand.lead = paragraphs(
  'Les candidatures sont fermées. Contactez AgroPulse pour manifester votre intérêt.',
  'Applications are closed. Contact AgroPulse to express your interest.',
);
const yidaInterest = getSection(yida, 'notif');
yidaInterest.title = localized('Manifester son intérêt pour YIDA-Cashew', 'Express interest in YIDA-Cashew');
yidaInterest.lead = paragraphs(
  'Envoyez une demande d’information via ce formulaire. Les dates et critères restent à confirmer.',
  'Use this form to request information. Dates and criteria are to be confirmed.',
);
yidaInterest.button = localized('Envoyer ma demande', 'Send my request');
yidaInterest.success = localized('Votre demande a bien été transmise à AgroPulse.', 'Your request has been sent to AgroPulse.');
yidaInterest.fields = [
  { name: 'email', label: localized('Adresse e-mail *', 'Email address *'), type: 'email', placeholder: localized('nom@organisation.org', 'name@organization.org'), required: true },
  { name: 'consent', label: localized('J’accepte que mes informations soient transmises à AgroPulse pour traiter ma demande.', 'I agree that my information may be sent to AgroPulse to handle my request.'), type: 'checkbox', required: true },
];

const agir = pages['agir-ia'];
if (!agir) throw new Error('Missing AGIR-IA page in the design page.');
agir.hero.title = localized('AGIR-IA', 'AGIR-IA');
agir.hero.lead = paragraphs(
  'AGIR-IA est distinct du programme YIDA-Cashew. La Fondation AWI est indiquée comme partenaire confirmé ; les informations détaillées sur les sessions restent à confirmer.',
  'AGIR-IA is distinct from YIDA-Cashew. The AWI Foundation is identified as a confirmed partner; detailed session information is to be confirmed.',
);
const agirOverview = getSection(agir, 'crowd');
agirOverview.title = localized('Une initiative distincte de YIDA-Cashew', 'An initiative distinct from YIDA-Cashew');
agirOverview.lead = [];
agirOverview.caption = localized(
  'Illustration non contractuelle ; le nombre de participantes et les sessions restent à confirmer.',
  'Illustration only; participant numbers and sessions are to be confirmed.',
);
const agirLearn = getSection(agir, 'apprend');
agirLearn.title = localized('À propos du programme', 'About the program');
agirLearn.lead = paragraphs(
  'La Fondation AWI est indiquée comme partenaire confirmé. Les détails des sessions seront publiés après confirmation.',
  'The AWI Foundation is identified as a confirmed partner. Session details will be shared once confirmed.',
);
setGroups(agirLearn, [
  { titleFr: 'AGIR-IA', titleEn: 'AGIR-IA', textFr: 'Un programme distinct de YIDA-Cashew.', textEn: 'A program distinct from YIDA-Cashew.' },
  { titleFr: 'Partenaire', titleEn: 'Partner', textFr: 'La Fondation AWI est indiquée comme partenaire confirmé.', textEn: 'The AWI Foundation is identified as a confirmed partner.' },
  { titleFr: 'Sessions', titleEn: 'Sessions', textFr: 'Informations détaillées à confirmer.', textEn: 'Detailed information to be confirmed.' },
]);
const agirInterest = getSection(agir, 'notif');
agirInterest.title = localized('Demander des informations sur AGIR-IA', 'Request information about AGIR-IA');
agirInterest.lead = paragraphs(
  'Les informations sur les prochaines sessions restent à confirmer.',
  'Information about upcoming sessions is to be confirmed.',
);
agirInterest.button = localized('Envoyer ma demande', 'Send my request');
agirInterest.success = localized('Votre demande a bien été transmise à AgroPulse.', 'Your request has been sent to AgroPulse.');
agirInterest.fields = [
  { name: 'email', label: localized('Adresse e-mail *', 'Email address *'), type: 'email', placeholder: localized('nom@organisation.org', 'name@organization.org'), required: true },
  { name: 'consent', label: localized('J’accepte que mes informations soient transmises à AgroPulse pour traiter ma demande.', 'I agree that my information may be sent to AgroPulse to handle my request.'), type: 'checkbox', required: true },
];

const contact = pages.contact;
if (!contact) throw new Error('Missing Contact page in the design page.');
contact.hero.lead = paragraphs(
  'Contact général, partenariat, formation ou demande de devis : transmettez votre demande à AgroPulse via le formulaire.',
  'General enquiries, partnerships, training or quotes: send your request to AgroPulse using the form.',
);
const channels = getSection(contact, 'canaux');
channels.title = localized('Nos pays d’intervention', 'Our countries of operation');
channels.lead = [];
setGroups(channels, [
  { titleFr: 'Côte d’Ivoire', titleEn: 'Côte d’Ivoire', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of operation listed.' },
  { titleFr: 'Sénégal', titleEn: 'Senegal', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of operation listed.' },
  { titleFr: 'Guinée-Bissau', titleEn: 'Guinea-Bissau', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of operation listed.' },
]);
const requestForm = getSection(contact, 'form');
requestForm.title = localized('Envoyer une demande', 'Send a request');
requestForm.lead = paragraphs(
  'Choisissez le type de demande. Les coordonnées destinataires sont configurées de manière sécurisée côté serveur.',
  'Choose a request type. Recipient details are configured securely on the server.',
);
requestForm.button = localized('Envoyer ma demande', 'Send my request');
requestForm.success = localized('Votre demande a bien été transmise à AgroPulse.', 'Your request has been sent to AgroPulse.');
requestForm.fields = [
  { name: 'name', label: localized('Nom complet *', 'Full name *'), type: 'text', placeholder: localized('Votre nom', 'Your name'), required: true },
  { name: 'email', label: localized('Adresse e-mail *', 'Email address *'), type: 'email', placeholder: localized('nom@organisation.org', 'name@organization.org'), required: true },
  { name: 'organization', label: localized('Organisation (facultatif)', 'Organization (optional)'), type: 'text', placeholder: localized('Nom de votre organisation', 'Organization name'), required: false },
  {
    name: 'type',
    label: localized('Type de demande *', 'Request type *'),
    type: 'select',
    required: true,
    options: [
      { value: '', fr: 'Choisir un type de demande', en: 'Choose a request type' },
      { value: 'contact', fr: 'Contact général', en: 'General enquiry' },
      { value: 'partnership', fr: 'Demande de partenariat', en: 'Partnership enquiry' },
      { value: 'training', fr: 'Formation / YIDA-Cashew / AGIR-IA', en: 'Training / YIDA-Cashew / AGIR-IA' },
      { value: 'quote', fr: 'Demande de devis', en: 'Quote request' },
    ],
  },
  { name: 'message', label: localized('Votre message *', 'Your message *'), type: 'textarea', placeholder: localized('Décrivez votre demande...', 'Describe your request...'), required: true },
  { name: 'consent', label: localized('J’accepte que mes informations soient transmises à AgroPulse pour le traitement de ma demande.', 'I agree that my information may be sent to AgroPulse to handle my request.'), type: 'checkbox', required: true },
];

html = html.replace(dataPattern, (_match, openingTag, _contents, closingTag) =>
  `${openingTag}${JSON.stringify(pages)}${closingTag}`);
html = html
  .replace('<title>AgroPulse — Aperçu des pages</title>', '<title>AgroPulse Global Solutions</title>')
  .replace('<meta content="AgroPulse — Aperçu des pages" property="og:title"/>', '<meta content="AgroPulse Global Solutions" property="og:title"/>')
  .replace('Nous répondons sous 48 heures ouvrées.', 'Transmettez votre demande via notre formulaire.')
  .replace('We reply within 48 working hours.', 'Send your request using our form.')
  .replace('Siège : Abidjan, Côte d’Ivoire', 'Côte d’Ivoire · Sénégal · Guinée-Bissau');

let appMatch;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gu)) {
  if (match[2].includes('function secHTML')) {
    appMatch = match;
    break;
  }
}
if (!appMatch) throw new Error('The design page is missing its page renderer.');
let appScript = appMatch[2];
const replaceOnce = (source, before, after, label) => {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected one ${label} replacement point in the page renderer.`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
};
appScript = appScript.replaceAll(
  'name="${E(tr(f.label))}"',
  'name="${E(f.name||tr(f.label))}"',
);
appScript = appScript
  .replaceAll("data-href=\"${PH('candidature')}\"", "data-href=\"${PH('fellowship')}\"")
  .replaceAll(
    "T('Candidater au programme Yidacashew','Apply to the Yidacashew')",
    "T('En savoir plus sur YIDA-Cashew','Learn more about YIDA-Cashew')",
  );
if (!appScript.includes('name="${E(f.name||tr(f.label))}"')) {
  throw new Error('Contact field names could not be added to the renderer.');
}
if (!appScript.includes('value="${E(o.value||\'\')}">${E(tr(o))}')) {
  appScript = replaceOnce(
    appScript,
    'value="${k?E(tr(o)):\'\'}">${E(tr(o))}',
    'value="${E(o.value||\'\')}">${E(tr(o))}',
    'select option values',
  );
}
if (!appScript.includes('const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\']')) {
  appScript = replaceOnce(
    appScript,
    'const demo=()=>SITE.settings&&SITE.settings.formEndpoint?',
    'const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\'].includes(CUR)&&SITE.settings&&SITE.settings.formEndpoint?',
    'active form helper',
  );
}
if (!appScript.includes('SITE.settings={formEndpoint:"/api/contact"};')) {
  appScript = replaceOnce(
    appScript,
    'CUR=null;',
    'CUR=null;SITE.settings={formEndpoint:"/api/contact"};',
    'server-side mail route setting',
  );
}
let sendFormStart = appScript.indexOf('function sendForm(f,m){');
while (sendFormStart >= 6 && appScript.slice(0, sendFormStart).endsWith('async ')) {
  sendFormStart -= 6;
}
const bindStepStart = appScript.indexOf('function bindStep(f,s){', sendFormStart);
if (sendFormStart < 0 || bindStepStart < 0) {
  throw new Error('The design page form submission function could not be located.');
}
appScript = appScript.slice(0, sendFormStart) + `async function sendForm(f,m){
 if(!f.checkValidity()){f.reportValidity();m.textContent=U('fill');m.className='msg er';return}
 const raw=Object.fromEntries(new FormData(f)),locale=document.documentElement.lang==='en'?'en':'fr';
 let d;
 if(CUR==='contact')d={name:raw.name,email:raw.email,organization:raw.organization||'',type:raw.type,message:raw.message,consent:raw.consent==='on',locale};
 else if(CUR==='fellowship'||CUR==='agir-ia')d={name:CUR==='fellowship'?'Intérêt YIDA-Cashew':'Intérêt AGIR-IA',email:raw.email,organization:'',type:'training',message:CUR==='fellowship'?'Demande d’information sur le programme YIDA-Cashew.':'Demande d’information sur le programme AGIR-IA.',consent:raw.consent==='on',locale};
 else{m.textContent=U('demo');m.className='msg';return}
 const ep=SITE.settings&&SITE.settings.formEndpoint;
 if(!ep){m.textContent=U('demo');m.className='msg';return}
 try{
  const response=await fetch(ep,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},credentials:'same-origin',body:JSON.stringify(d)});
  const result=await response.json();
  if(!response.ok||result.ok!==true){
   m.textContent=response.status===503?(EN()?'The request service is not configured yet. Please try again later.':'Le service de réception des demandes n’est pas encore configuré. Veuillez réessayer plus tard.'):response.status===429?(EN()?'Too many attempts. Please try again later.':'Trop de tentatives. Veuillez réessayer plus tard.'):(EN()?'The request could not be sent. Please check the form and try again.':'L’envoi a échoué. Vérifiez le formulaire puis réessayez.');
   m.className='msg er';return
  }
  m.textContent=EN()?'Your request has been sent to AgroPulse.':'Votre demande a bien été transmise à AgroPulse.';
  m.className='msg ok';f.reset()
 }catch{
  m.textContent=EN()?'The delivery service could not be reached. Please try again.':'Impossible de joindre le service. Veuillez réessayer.';
  m.className='msg er'
 }
}` + appScript.slice(bindStepStart);
const endpointPattern = /"formEndpoint"\s*:\s*"[^"]*"/gu;
if (!/"formEndpoint"\s*:\s*"[^"]*"/u.test(appScript)) {
  throw new Error('Contact API endpoint was not configured in the design page.');
}
appScript = appScript.replace(endpointPattern, '"formEndpoint":"/api/contact"');
if (!appScript.includes('"formEndpoint":"/api/contact"')) {
  throw new Error('Contact API endpoint was not configured in the design page.');
}
html = html.slice(0, appMatch.index) + appMatch[0].replace(appMatch[2], appScript) + html.slice(appMatch.index + appMatch[0].length);

await writeFile(indexPath, html);
console.log(`Built the approved maquette page and updated validated content; ${imageFiles.size} embedded image assets externalized.`);
