import { applyVisualAssets, visualFallbacks, visualPath } from './visual-assets.mjs';
import { expertiseAreas, applyProgrammeContent } from './editorial-content.mjs';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const indexPath = path.join(publicRoot, 'index.html');
const imageDirectory = path.join(publicRoot, 'assets', 'maquette');
let html = await readFile(indexPath, 'utf8');
html = html.replace(
  '<a class="skip" href="#app">Aller au contenu</a>',
  '<a class="skip" href="#app" data-en="Skip to content">Aller au contenu</a>',
);
if (!html.includes('data-en-aria-label="Main navigation"')) {
  html = html.replace(
    'aria-label="Navigation principale"',
    'aria-label="Navigation principale" data-fr-aria-label="Navigation principale" data-en-aria-label="Main navigation"',
  );
}
const socialLinks = /<a aria-label="(?:LinkedIn|Facebook|YouTube|TikTok)" href="#">([\s\S]*?)<\/a>/gu;
html = html.replace(socialLinks, '<span class="social-placeholder" aria-hidden="true">$1</span>');
if (html.includes('.soc a{')) {
  html = html.replace('.soc a{', '.soc a,.soc .social-placeholder{');
}
const oldFooterLocation = '<span data-en="Headquarters: Abidjan, Côte d’Ivoire">Côte d’Ivoire · Sénégal · Guinée-Bissau</span>';
const validatedFooterLocation = '<span data-fr="Pays d’intervention : Côte d’Ivoire · Sénégal · Guinée-Bissau" data-en="Countries of intervention: Côte d’Ivoire · Senegal · Guinea-Bissau">Pays d’intervention : Côte d’Ivoire · Sénégal · Guinée-Bissau</span>';
if (html.includes(oldFooterLocation)) {
  html = html.replace(oldFooterLocation, validatedFooterLocation);
}
if (!html.includes('aria-controls="nav"')) {
  html = html.replace('<button id="bg"', '<button id="bg" aria-controls="nav"');
}
if (!html.includes('.toc{position:static;grid-template-columns:minmax(0,1fr)!important}')) {
  const styleEnd = html.indexOf('</style>');
  if (styleEnd < 0) throw new Error('The design page is missing its stylesheet.');
  const legalMobileRules = '@media(max-width:860px){.lg2{grid-template-columns:minmax(0,1fr);gap:24px}.toc{position:static;grid-template-columns:minmax(0,1fr)!important}.toc a{min-width:0;white-space:normal!important}}';
  html = html.slice(0, styleEnd) + legalMobileRules + html.slice(styleEnd);
}
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
const legalTranslations = {
  'mentions-legales': {
    eyebrow: 'Transparency',
    title: 'Legal notice',
    aside: ['Draft pending legal review', 'Last updated: [to be completed]'],
    groups: [
      { title: 'Publisher identity', text: 'The legal identity of the publisher must be provided and approved.' },
      { title: 'Publication manager', text: 'The person responsible for publication must be designated.' },
      { title: 'Hosting provider', text: 'The hosting provider must be identified once the service is confirmed.' },
    ],
  },
  confidentialite: {
    eyebrow: 'Privacy & personal data',
    title: 'Privacy policy',
    aside: ['Draft pending legal review', 'Last updated: [to be completed]'],
    groups: [
      {
        title: 'How you contact us',
        text: 'Through the contact, partnership, training or quote forms, and resource-notification requests.',
      },
      {
        title: 'How we handle your information',
        text: 'The purposes and handling of these requests remain to be specified and approved.',
      },
      {
        title: 'Your data-protection rights',
        text: 'How people may exercise their data-protection rights remains to be specified and approved.',
      },
    ],
  },
};
for (const [slug, translation] of Object.entries(legalTranslations)) {
  const page = pages[slug];
  const section = page?.sections?.[0];
  if (!page?.hero || !section?.groups || section.groups.length !== translation.groups.length) {
    throw new Error(`The legal content structure for "${slug}" has changed.`);
  }
  page.title.en = translation.title;
  page.hero.eyebrow.en = translation.eyebrow;
  page.hero.title.en = translation.title;
  page.hero.aside.forEach((item, index) => {
    item.en = translation.aside[index];
  });
  section.groups.forEach((group, index) => {
    group.title.en = translation.groups[index].title;
    group.text[0].en = translation.groups[index].text;
  });
}
const privacyGroups = pages.confidentialite.sections[0].groups;
privacyGroups[0].text[0].fr = 'Via les formulaires de contact, de partenariat, de formation et de devis, et les demandes de notification de ressource.';
privacyGroups[1].text[0].fr = 'Les finalités et modalités de traitement des demandes restent à préciser et à faire valider.';
privacyGroups[2].text[0].fr = 'Les modalités d’exercice des droits des personnes concernées restent à préciser et à faire valider.';
const localized = (fr, en) => ({ fr, en });
const paragraphs = (fr, en) => [localized(fr, en)];
const getSection = (page, id) => {
  const section = page.sections?.find(item => item.id === id);
  if (!section) throw new Error(`Missing section "${id}" in page "${page.slug}".`);
  return section;
};
const setGroup = (group, item) => {
  group.title = localized(item.titleFr, item.titleEn);
  if (item.image) group.image = item.image;
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

const expertise = expertiseAreas.map((item, index) => ({
  ...item, image: pages[item.slug]?.hero?.image,
}));
const expertiseDetails = expertise.map(item => item.details);

expertise.forEach((item, index) => {
  const page = pages[`pole-${index + 1}`];
  if (!page) throw new Error(`Missing expertise page "pole-${index + 1}" in the design page.`);
  page.title = localized(item.titleFr, item.titleEn);
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
  section.title = localized('Huit pôles complémentaires', 'Eight complementary areas of expertise');
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
expertisePage.hero.title = localized('Des savoir-faire au service de l’agriculture', 'Expertise serving agriculture');
expertisePage.hero.lead = paragraphs(
  'Huit pôles réunissent nos compétences pour accompagner les acteurs agricoles, du développement des talents aux solutions de terrain.',
  'Eight areas bring together our skills to support agricultural stakeholders, from talent development to practical solutions.',
);
const expertiseOverview = getSection(expertisePage, 'poles');
expertiseOverview.title = localized('Nos domaines d’intervention', 'Our fields of action');
expertiseOverview.lead = paragraphs(
  'Explorez nos spécialités pour trouver l’accompagnement adapté à vos besoins.',
  'Explore our specialisms to find the support that fits your needs.',
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
  titleFr: 'TRAORE Armelle',
  titleEn: 'TRAORE Armelle',
  textFr: 'Gérante',
  textEn: 'Managing Director',
}, {
  titleFr: 'NICHI Helene',
  titleEn: 'NICHI Helene',
  textFr: 'Project Manager',
  textEn: 'Project Manager',
}]);
const aboutFacts = getSection(about, 'impact');
aboutFacts.title = localized('Repères AgroPulse', 'AgroPulse at a glance');
aboutFacts.lead = paragraphs(
  'Les informations validées présentent huit pôles d’expertise et des pays d’intervention en Afrique de l’Ouest.',
  'Validated information identifies eight areas of expertise and countries of operation in West Africa.',
);
setGroups(aboutFacts, [
  {
    titleFr: '8 pôles d’expertise',
    titleEn: '8 areas of expertise',
    textFr: 'Formation, systèmes d’information, IA, climat, entrepreneuriat, conseil, experts et mécanisation.',
    textEn: 'Training, information systems, AI, climate, entrepreneurship, consulting, experts and mechanisation.',
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
contact.title = localized('Contacts', 'Contact');
contact.hero.lead = paragraphs(
  'Contact général, partenariat, formation ou demande de devis : transmettez votre demande à AgroPulse via le formulaire.',
  'General enquiries, partnerships, training or quotes: send your request to AgroPulse using the form.',
);
const channels = getSection(contact, 'canaux');
channels.title = localized('Nos pays d’intervention', 'Countries of intervention');
channels.lead = [];
setGroups(channels, [
  { titleFr: 'Côte d’Ivoire', titleEn: 'Côte d’Ivoire', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of intervention listed.' },
  { titleFr: 'Sénégal', titleEn: 'Senegal', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of intervention listed.' },
  { titleFr: 'Guinée-Bissau', titleEn: 'Guinea-Bissau', textFr: 'Pays d’intervention indiqué.', textEn: 'Country of intervention listed.' },
]);
for (const location of channels.groups) {
  if (location.meta?.some(value => value.includes('HQ') || value.includes('Siège'))) location.meta = [];
}
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

const partners = pages.partenaires;
if (!partners) throw new Error('Missing Partners page in the design page.');
partners.hero.lead = paragraphs(
  'Vous souhaitez collaborer avec AgroPulse ? Présentez votre organisation et votre proposition via le formulaire.',
  'Interested in working with AgroPulse? Tell us about your organisation and proposal using the form.',
);
partners.hero.ctas = [{
  label: localized('Devenir partenaire', 'Become a partner'),
  to: '#sec-form',
}];
const partnerSteps = getSection(partners, 'etapes');
partnerSteps.title = localized('Une démarche de partenariat', 'A partnership process');
setGroups(partnerSteps, [
  { titleFr: 'Prise de contact', titleEn: 'Initial contact', textFr: 'Présentez votre organisation et votre proposition.', textEn: 'Introduce your organisation and proposal.' },
  { titleFr: 'Échange', titleEn: 'Discussion', textFr: 'Les modalités sont examinées avec AgroPulse.', textEn: 'Potential arrangements are discussed with AgroPulse.' },
  { titleFr: 'Suite à convenir', titleEn: 'Next steps', textFr: 'Les étapes sont définies selon le projet.', textEn: 'Next steps are agreed according to the project.' },
]);
const partnerForm = getSection(partners, 'form');
partnerForm.title = localized('Présenter une demande de partenariat', 'Submit a partnership enquiry');
partnerForm.lead = paragraphs(
  'Votre demande sera transmise à AgroPulse. Les modalités d’un partenariat seront discutées directement.',
  'Your enquiry will be sent to AgroPulse. Partnership arrangements will be discussed directly.',
);
partnerForm.button = localized('Envoyer ma demande', 'Send my enquiry');
partnerForm.success = localized('Votre demande a bien été transmise à AgroPulse.', 'Your enquiry has been sent to AgroPulse.');
partnerForm.fields = [
  { name: 'name', label: localized('Nom complet *', 'Full name *'), type: 'text', placeholder: localized('Votre nom', 'Your name'), required: true },
  { name: 'email', label: localized('Adresse e-mail *', 'Email address *'), type: 'email', placeholder: localized('nom@organisation.org', 'name@organization.org'), required: true },
  { name: 'organization', label: localized('Organisation (facultatif)', 'Organization (optional)'), type: 'text', placeholder: localized('Nom de votre organisation', 'Organization name'), required: false },
  { name: 'message', label: localized('Votre proposition *', 'Your proposal *'), type: 'textarea', placeholder: localized('Présentez brièvement votre organisation et votre proposition...', 'Briefly describe your organisation and proposal...'), required: true },
  { name: 'consent', label: localized('J’accepte que mes informations soient transmises à AgroPulse pour le traitement de ma demande.', 'I agree that my information may be sent to AgroPulse to handle my enquiry.'), type: 'checkbox', required: true },
];

const resources = pages.ressources;
if (!resources) throw new Error('Missing Resources page in the design page.');
// Public files are explicitly listed; internal project documents are never enumerated.
const catalog = JSON.parse(await readFile(path.join(publicRoot, 'documents', 'catalog.json'), 'utf8'));
if (catalog.some(item => item.filename === 'revue-yida-cashew-n01.pdf')) throw new Error('YIDA-Cashew is an information page, not a public PDF download.');
const documents = [];
for (const document of catalog) {
  if (!/^[a-z0-9][a-z0-9-]*\.pdf$/u.test(document.filename)) throw new Error('Invalid public PDF filename');
  const pdfPath = path.join(publicRoot, 'documents', document.filename);
  const contents = await readFile(pdfPath);
  if (contents.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF document');
  const info = await stat(pdfPath);
  documents.push({ ...document, href: '/documents/' + document.filename, bytes: info.size });
}
const downloadSection = (id) => ({
  id, type: 'downloads', title: localized('Documents à télécharger', 'Download documents'),
  lead: paragraphs('Consultez les publications AgroPulse.', 'Explore AgroPulse publications.'),
  groups: documents,
});
resources.hero.eyebrow = localized('Publications', 'Publications');
resources.hero.lead = paragraphs(
  'Retrouvez les publications AgroPulse et téléchargez les documents disponibles.',
  'Browse AgroPulse publications and download available documents.',
);
const resourceExamples = getSection(resources, 'exemples');
Object.assign(resourceExamples, downloadSection('exemples'));
yida.sections = yida.sections.filter(section => section.id !== 'documents');
yida.sections.splice(1, 0, downloadSection('documents'));
const resourceNotice = getSection(resources, 'notif');
resourceNotice.title = localized('Demander à être informé(e)', 'Request an update');
resourceNotice.lead = paragraphs(
  'Transmettez votre adresse à AgroPulse pour exprimer votre intérêt. Cette demande ne vous inscrit pas automatiquement à une liste de diffusion.',
  'Send your email to AgroPulse to express your interest. This request does not automatically subscribe you to a mailing list.',
);
resourceNotice.button = localized('Transmettre ma demande', 'Send my request');
resourceNotice.success = localized('Votre demande a bien été transmise à AgroPulse.', 'Your request has been sent to AgroPulse.');
resourceNotice.fields = [
  { name: 'email', label: localized('Adresse e-mail *', 'Email address *'), type: 'email', placeholder: localized('votre.email@exemple.org', 'your.email@example.org'), required: true },
  { name: 'consent', label: localized('J’accepte que mon adresse soit transmise à AgroPulse pour traiter cette demande.', 'I agree that my email may be sent to AgroPulse to handle this request.'), type: 'checkbox', required: true },
];
const network = getSection(pages.accueil, 'reseau-international');
network.lead = paragraphs(
  'Retrouvez nos partenaires sur le globe. Sélectionnez un partenaire pour centrer la vue sur sa localité, ou faites glisser le globe pour l’explorer.',
  'Locate our partners on the globe. Select a partner to centre the view on their locality, or drag the globe to explore it.',
);

for (const page of Object.values(pages)) {
  if (page.title && !page.title.en && page.hero?.title?.en) {
    page.title.en = page.hero.title.en.replace(/<[^>]*>/gu, ' ').replace(/\s+/gu, ' ').trim();
  }
}

applyProgrammeContent(pages);
applyVisualAssets(pages);
const countryMapSection = compact => ({
  id: 'pays-intervention', type: 'countrymap', compact,
  kicker: localized('Afrique de l’Ouest', 'West Africa'),
  title: localized(compact ? 'Un ancrage régional, des liens de proximité' : 'Retrouvez nos pays d’intervention', compact ? 'Regional roots, local connections' : 'Find our countries of intervention'),
  lead: paragraphs(
    compact ? 'Nos expertises accompagnent les acteurs agricoles en Côte d’Ivoire, au Sénégal et en Guinée-Bissau.' : 'Vous avez une demande dans l’un de ces pays ? Sélectionnez-le sur la carte, puis présentez-nous vos besoins.',
    compact ? 'Our expertise supports agricultural stakeholders in Côte d’Ivoire, Senegal and Guinea-Bissau.' : 'Have an enquiry concerning one of these countries? Select it on the map, then tell us what you need.',
  ),
  groups: [
    {code:'CI',title:localized('Côte d’Ivoire','Côte d’Ivoire'),text:paragraphs('Contactez notre équipe pour un besoin concernant la Côte d’Ivoire.','Contact our team about a need in Côte d’Ivoire.')},
    {code:'SN',title:localized('Sénégal','Senegal'),text:paragraphs('Vous portez une initiative au Sénégal ? Présentez-nous vos besoins.','Working on an initiative in Senegal? Tell us what you need.')},
    {code:'GW',title:localized('Guinée-Bissau','Guinea-Bissau'),text:paragraphs('Échangeons sur l’accompagnement recherché en Guinée-Bissau.','Let’s discuss the support you are looking for in Guinea-Bissau.')},
  ],
});
for(const slug of ['contact','accueil']){
  const page=pages[slug];page.sections=page.sections.filter(section=>section.id!=='pays-intervention');
  const beforeId=slug==='contact'?'form':'reseau-international';
  const index=page.sections.findIndex(section=>section.id===beforeId);
  if(index<0)throw new Error('Missing insertion point for country map: '+slug);
  page.sections.splice(index,0,countryMapSection(slug==='accueil'));
}


html = html.replace(dataPattern, (_match, openingTag, _contents, closingTag) =>
  `${openingTag}${JSON.stringify(pages)}${closingTag}`);
html = html
  .replace('<title>AgroPulse — Aperçu des pages</title>', '<title>AgroPulse Global Solutions</title>')
  .replace('<meta content="AgroPulse — Aperçu des pages" property="og:title"/>', '<meta content="AgroPulse Global Solutions" property="og:title"/>')
  .replace('Nous répondons sous 48 heures ouvrées.', 'Transmettez votre demande via notre formulaire.')
  .replace('We reply within 48 working hours.', 'Send your request using our form.')
  .replace('Siège : Abidjan, Côte d’Ivoire', 'Côte d’Ivoire · Sénégal · Guinée-Bissau');

const updatePartnerGlobe = source => {
  if (source.includes('/* partner geographic markers */')) return source;
  const start = source.indexOf('function initGlobe('), end = source.indexOf('function initLab(', start);
  if (start < 0 || end < 0) throw new Error('Missing partner globe renderer.');
  let globe = source.slice(start, end);
  const patch = (before, after) => { if (!globe.includes(before)) throw new Error('Partner globe anchor missing: ' + before.slice(0, 70)); globe = globe.replace(before, after); };
  patch('function initGlobe(partners,countries,details,hq){', 'function initGlobe(partners,countries,details,hq){/* partner geographic markers */');
  patch('gv=true,sats=[];', 'gv=true,sats=[],hits=[];');
  patch("(e?'Headquarters: ':'Siège : ')", "(e?'Location: ':'Localisation : ')");
  patch("(e?'Projects run with this partner':'Projets menés avec ce partenaire')", "(e?'Initiatives with this partner':'Initiatives avec ce partenaire')");
  patch("+'</p><h4>'", "+'</p><p class=\"globe-location-note\">'+(d.hq?(e?'City-level marker':'Repère à l’échelle de la ville'):(e?'Location to be provided':'Localisation à renseigner'))+'</p><h4>'");
  patch('if(m){tl=m.lon;tp=m.lat}else tl=null;rP()', "if(m){tl=m.lon;tp=m.lat;if(rm){lam=tl;phi=tp}}else tl=null;gb.setAttribute('aria-label',(lg()?'Partner locations on the globe: ':'Localisation des partenaires sur le globe : ')+PD[k].n[lg()]+(Lx(PD[k].hl)?' — '+Lx(PD[k].hl):''));rP()");
  patch('sats.forEach(s=>{if(Math.hypot(s.x-x,s.y-y)<20)pickP(s.k)})', "const hit=hits.filter(s=>Math.hypot(s.x-x,s.y-y)<22).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(hit){pickP(hit.k);if(hit.t==='p')pickJ(hit.j)}");
  patch('g2.clearRect(0,0,W,W);', 'g2.clearRect(0,0,W,W);hits=[];');
  patch('sats=PD.map((d,k)=>{const p=op(gt*.9+k*6.2832/N);return{k,x:p.x,y:p.y,z:p.z,d}});', 'sats=[];');
  const curveStart=globe.indexOf('const s0=sats[m.k];'),curveEnd=globe.indexOf('g2.setLineDash([])',curveStart);
  if(curveStart<0||curveEnd<0)throw new Error('Missing orbital connection curve');
  globe=globe.slice(0,curveStart)+globe.slice(curveEnd+'g2.setLineDash([])'.length);
  patch("col=m.t=='p'?'143,227,138':'126,224,245';", "col=m.t=='p'?'143,227,138':'126,224,245';hits.push({...m,x,y});");
  patch("g2.textAlign='left';g2.fillText(lb,x+12,y-10)", "g2.textAlign='center';const labelX=clamp(x,16,W-16);g2.fillText(lb,labelX,y-24,W-32);g2.font='600 11px Manrope,sans-serif';g2.fillStyle='#b7e6a5';g2.fillText(d.n[e],labelX,y-43,W-32)");
  patch('gframe();', "gb.addEventListener('pointercancel',()=>{drag=null});gframe();");
  return source.slice(0,start)+globe+source.slice(end);
};

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
const updateSiteData = (source, assignment) => {
  const assignmentIndex = source.indexOf(assignment);
  if (assignmentIndex < 0) throw new Error(`The embedded site data assignment "${assignment}" could not be located.`);
  const jsonStart = assignmentIndex + assignment.length;
  let jsonEnd = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = jsonStart; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        jsonEnd = index + 1;
        break;
      }
    }
  }
  if (jsonEnd < 0) throw new Error(`The embedded site data object "${assignment}" is incomplete.`);
  const site = JSON.parse(source.slice(jsonStart, jsonEnd));
  if (!site.ancrage || !Array.isArray(site.ancrage.details) || !Array.isArray(site.ancrage.countries)) {
    throw new Error('The country map data structure has changed.');
  }
  site.ancrage.lead = localized(
    'Pays d’intervention : Côte d’Ivoire, Sénégal et Guinée-Bissau.',
    'Countries of intervention: Côte d’Ivoire, Senegal and Guinea-Bissau.',
  );
  for (const detail of site.ancrage.details) {
    detail.role = localized('Pays d’intervention', 'Country of intervention');
    detail.text = localized('Pays d’intervention indiqué.', 'Country of intervention listed.');
    detail.facts = [];
  }
  // City confirmed by the project owner on 5 November 2026; a city marker, not a street address.
  // Abidjan coordinates: https://www.geonames.org/2293538/abidjan.html (CC BY GeoNames).
  for (const partner of site.partners || []) {
    if (partner.name?.fr === 'Fondation AWI' && partner.status === 'confirmed') {
      partner.hq = { label: localized('Abidjan, Côte d’Ivoire', 'Abidjan, Côte d’Ivoire'), lat: 5.35444, lon: -4.00167, precision: 'city' };
    }
  }
  site.hq = null;
  return source.slice(0, jsonStart) + JSON.stringify(site) + source.slice(jsonEnd);
};
appScript = updateSiteData(appScript, 'window.SITE0=');
appScript = updateSiteData(appScript, 'let PAGES={},SITE=');
for (const [before, after] of [
  ['"Our countries of operation"', '"Countries of intervention listed"'],
  ['"Country of operation listed."', '"Country of intervention listed."'],
  ['"meta":["Siège ¦ HQ"]', '"meta":[]'],
]) {
  appScript = appScript.replaceAll(before, after);
}
if (!appScript.includes('const CMS_HOME_TEXT={fr:{},en:{}};')) {
  appScript = replaceOnce(
    appScript,
    'function setLang(l){',
    'const CMS_HOME_TEXT={fr:{},en:{}};function setLang(l){',
    'published homepage language state',
  );
}
const routeHelper = "const PH=slug=>slug=='accueil'?CFG.home:CFG.spa?'#p-'+slug:slug+'.html';";
if (appScript.includes(routeHelper)) {
  appScript = replaceOnce(
    appScript,
    routeHelper,
    "const PH=slug=>slug.startsWith('#')?slug:slug=='accueil'?CFG.home:CFG.spa?'#p-'+slug:slug+'.html';",
    'explicit page and section anchors',
  );
}
const mosaicRenderer = 'mosaic:s=>`<div class="w">${sh(s)}<div class="mo${s.variant?\' \'+s.variant:\'\'}">${s.groups.map((g,i)=>`<a class="mt" href="${g.to?PH(g.to):\'#\'}" style="--d:${i*.08}s"><img src="${E(g.image)}" alt="" loading="lazy"><span><b>${E(tr(g.title))}</b></span></a>`).join(\'\')}</div></div>`,';
if (appScript.includes(mosaicRenderer)) {
  appScript = replaceOnce(
    appScript,
    mosaicRenderer,
    'mosaic:s=>`<div class="w">${sh(s)}<div class="mo${s.variant?\' \'+s.variant:\'\'}">${s.groups.map((g,i)=>`<${g.to?\'a\':\'div\'} class="mt"${g.to?` href="${E(PH(g.to))}"`:\'\'} style="--d:${i*.08}s"><img src="${E(g.image)}" alt="" loading="lazy"><span><b>${E(tr(g.title))}</b></span></${g.to?\'a\':\'div\'}>`).join(\'\')}</div></div>`,',
    'non-link informational mosaic cards',
  );
}
const legalAnchor = '<a href="#" data-go="lg${i}">';
if (appScript.includes(legalAnchor)) {
  appScript = replaceOnce(
    appScript,
    legalAnchor,
    '<a href="#lg${i}" data-go="lg${i}">',
    'legal table of contents anchors',
  );
}
const legalNavigationLabel = 'aria-label="Sommaire"';
if (appScript.includes(legalNavigationLabel)) {
  appScript = replaceOnce(
    appScript,
    legalNavigationLabel,
    'aria-label="${EN()?\'Table of contents\':\'Sommaire\'}"',
    'localized legal table of contents label',
  );
}
const originalLanguageSwap = "qa('[data-en]').forEach(el=>el.innerHTML=l=='en'?el.dataset.en:el.dataset.fr);";
if (appScript.includes(originalLanguageSwap)) {
  appScript = replaceOnce(
    appScript,
    originalLanguageSwap,
    "qa('[data-en]').forEach(el=>{const key=el.dataset.cms==='hero.title'?'title':el.dataset.cms==='hero.subtitle'?'intro':null,value=key&&CMS_HOME_TEXT[l][key];if(value)el.textContent=value;else el.innerHTML=l=='en'?el.dataset.en:el.dataset.fr});",
    'safe published homepage language rendering',
  );
}
const renderStart = 'function render(){clearInterval(window.MFT);';
if (appScript.includes(renderStart) && !appScript.includes("qa('[data-en-aria-label]')")) {
  appScript = replaceOnce(
    appScript,
    renderStart,
    "function render(){clearInterval(window.MFT);qa('[data-en-aria-label]').forEach(e=>e.setAttribute('aria-label',EN()?e.dataset.enAriaLabel:e.dataset.frAriaLabel));",
    'localized navigation landmark label',
  );
}
const languageSave = "try{localStorage.setItem('ap-lang',l)}catch(e){}render();";
if (appScript.includes(languageSave)) {
  appScript = replaceOnce(
    appScript,
    languageSave,
    "try{localStorage.setItem('ap-lang',l)}catch(e){}const url=new URL(location.href);url.searchParams.set('lang',l);history.replaceState(null,'',url);render();",
    'shareable language selection',
  );
}
const dataGoBinding = "qa('#app [data-go]').forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.go)});";
if (appScript.includes(dataGoBinding)) {
  appScript = replaceOnce(
    appScript,
    dataGoBinding,
    "qa('#app [data-go]').forEach(a=>{const target=document.getElementById(a.dataset.go)?a.dataset.go:'sec-'+a.dataset.go;a.setAttribute('href','#'+target);a.onclick=e=>{e.preventDefault();go(a.dataset.go)}});",
    'real destinations for section links',
  );
}
const homeContentLoader = `let homeContentRequest=0;
async function loadPublishedHome(){
 if(window.AGROPULSE_PAGE_CONTENT_READY)return;
 const hero=q('.home-hero');if(!hero)return;
 const locale=EN()?'en':'fr',request=++homeContentRequest;
 try{
  const response=await fetch('/api/home-content?locale='+locale,{cache:'no-store'});
  const result=await response.json();
  if(request!==homeContentRequest||CUR!=='accueil'||locale!==(EN()?'en':'fr'))return;
  if(!response.ok||!['published','reference'].includes(result.status))throw new Error('Published homepage content is unavailable.');
  hero.dataset.cmsContentState=result.status;
  if(result.status==='published'){
   for(const [key,field] of [['title','hero.title'],['intro','hero.subtitle']]){
    const value=result.content?.[key],target=hero.querySelector('[data-cms="'+field+'"]');
    if(typeof value==='string'&&value.trim()&&target){CMS_HOME_TEXT[locale][key]=value;target.textContent=value}
    else{delete CMS_HOME_TEXT[locale][key];if(target)target.innerHTML=locale==='en'?target.dataset.en:target.dataset.fr}
   }
  }else{
   for(const [key,field] of [['title','hero.title'],['intro','hero.subtitle']]){
    delete CMS_HOME_TEXT[locale][key];
    const target=hero.querySelector('[data-cms="'+field+'"]');
    if(target)target.innerHTML=locale==='en'?target.dataset.en:target.dataset.fr;
   }
  }
 }catch{
  if(request!==homeContentRequest)return;
  hero.dataset.cmsContentState='unavailable';
  console.warn('Published AgroPulse homepage copy is unavailable; the approved reference copy remains visible.');
 }
}
`;
const startupMarker = '/* --- démarrage --- */';
const homeContentLoaderStart = appScript.indexOf('let homeContentRequest=0;');
if (homeContentLoaderStart >= 0) {
  const homeContentLoaderEnd = appScript.indexOf(startupMarker, homeContentLoaderStart);
  if (homeContentLoaderEnd < 0) throw new Error('The published homepage loader is not properly terminated.');
  appScript = appScript.slice(0, homeContentLoaderStart) + homeContentLoader + appScript.slice(homeContentLoaderEnd);
} else {
  if (appScript.includes('async function loadPublishedHome()')) {
    throw new Error('The published homepage loader marker is missing.');
  }
  appScript = replaceOnce(
    appScript,
    startupMarker,
    homeContentLoader + startupMarker,
    'published homepage loader',
  );
}
if (!appScript.includes("if(CFG.spa&&CUR==='accueil')void loadPublishedHome()")) {
  appScript = replaceOnce(
    appScript,
    'render()}\nq(\'#lang\').onclick=',
    "render();if(CFG.spa&&CUR==='accueil')void loadPublishedHome()}\nq('#lang').onclick=",
    'reload published homepage after language change',
  );
  appScript = replaceOnce(
    appScript,
    'else CUR=document.body.dataset.page;render()}',
    "else CUR=document.body.dataset.page;render();if(CFG.spa&&CUR==='accueil')void loadPublishedHome()}",
    'load published homepage after navigation',
  );
}
const oldLanguageInitializer = "try{if(localStorage.getItem('ap-lang')=='en'){document.documentElement.lang='en';qa('[data-en]').forEach(el=>el.innerHTML=el.dataset.en);q('#lang').textContent='FR'}}catch(e){}";
if (appScript.includes(oldLanguageInitializer)) {
  appScript = replaceOnce(
    appScript,
    oldLanguageInitializer,
    "try{const requestedLanguage=new URLSearchParams(location.search).get('lang'),storedLanguage=localStorage.getItem('ap-lang'),initialLanguage=requestedLanguage==='fr'||requestedLanguage==='en'?requestedLanguage:storedLanguage;if(initialLanguage==='fr'||initialLanguage==='en'){document.documentElement.lang=initialLanguage;qa('[data-en]').forEach(el=>el.innerHTML=initialLanguage==='en'?el.dataset.en:el.dataset.fr);q('#lang').textContent=initialLanguage==='en'?'FR':'EN';if(requestedLanguage==='fr'||requestedLanguage==='en')localStorage.setItem('ap-lang',initialLanguage)}}catch(e){}",
    'initial language from URL and saved preference',
  );
}
const menuHandler = "const nav=q('#nav'),bg=q('#bg');bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)};nav.onclick=e=>{if(e.target.closest('a')){nav.classList.remove('open');bg.setAttribute('aria-expanded',false)}};";
const keyboardDismissHandler = "document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.focus()}});";
if (appScript.includes(menuHandler) && !appScript.includes(keyboardDismissHandler)) {
  appScript = replaceOnce(
    appScript,
    menuHandler,
    `${menuHandler}${keyboardDismissHandler}`,
    'keyboard dismissal of mobile navigation',
  );
}
if (!appScript.includes('downloads:s=>')) {
  appScript = appScript.replace('const BT={', 'const BT={\n' + "downloads:s=>`<div class=\"w\">${sh(s)}<div class=\"fx\">${s.groups.map(g=>`<article class=\"fr\"><div><h3>${E(tr(g.title))}</h3><p>${E(tr(g.description))}</p><p>${E(tr(g.edition))} · PDF · ${E(g.language==='fr'?(EN()?'French':'Français'):g.language==='en'?(EN()?'English':'Anglais'):g.language)} · ${new Intl.NumberFormat(EN()?'en':'fr',{maximumFractionDigits:1}).format(g.bytes/1000000)} ${EN()?'MB':'Mo'}</p><a class=\"btn\" href=\"${E(g.href)}\" download=\"${E(g.filename)}\">${ico('download')}${EN()?'Download':'Télécharger'} — ${E(tr(g.title))}</a></div></article>`).join('')}</div></div>`," + '\n');
}
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
const activeFormHelper = 'const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\',\'partenaires\',\'ressources\']';
if (!appScript.includes(activeFormHelper)) {
  const malformedFormHelper = 'const demo()=>[\'contact\',\'fellowship\',\'agir-ia\',\'partenaires\',\'ressources\']';
  const previousFormHelper = 'const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\']';
  if (appScript.includes(malformedFormHelper)) {
    appScript = replaceOnce(
      appScript,
      malformedFormHelper,
      activeFormHelper,
      'active form helper',
    );
  } else if (appScript.includes(previousFormHelper)) {
    appScript = replaceOnce(
      appScript,
      previousFormHelper,
      'const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\',\'partenaires\',\'ressources\']',
      'active form helper',
    );
  } else {
    appScript = replaceOnce(
      appScript,
      'const demo=()=>SITE.settings&&SITE.settings.formEndpoint?',
      'const demo=()=>[\'contact\',\'fellowship\',\'agir-ia\',\'partenaires\',\'ressources\'].includes(CUR)&&SITE.settings&&SITE.settings.formEndpoint?',
      'active form helper',
    );
  }
}
if (!appScript.includes('SITE.settings={formEndpoint:"/api/contact"};')) {
  appScript = replaceOnce(
    appScript,
    'CUR=null;',
    'CUR=null;SITE.settings={formEndpoint:"/api/contact"};',
    'server-side mail route setting',
  );
}
if (!appScript.includes('SITE.partners=SITE.partners.filter(p=>p.status==="confirmed")')) {
  appScript = replaceOnce(
    appScript,
    'SITE.settings={formEndpoint:"/api/contact"};',
    'SITE.settings={formEndpoint:"/api/contact"};SITE.partners=SITE.partners.filter(p=>p.status==="confirmed").map(p=>({...p,projects:[]}));',
    'confirmed partner data',
  );
}
const countryRenderer = await readFile(new URL('./country-map-renderer.js', import.meta.url), 'utf8');
const countryStart = '/* AgroPulse country map renderer:start */', countryEnd = '/* AgroPulse country map renderer:end */';
const countryBlock = countryStart + '\n' + countryRenderer + '\n' + countryEnd + '\n';
if(appScript.includes(countryStart)){
  const start=appScript.indexOf(countryStart),end=appScript.indexOf(countryEnd,start);
  if(end<0)throw new Error('Incomplete country map renderer');
  appScript=appScript.slice(0,start)+countryBlock+appScript.slice(end+countryEnd.length).replace(/^[\r\n]+/u,'');
}else{
  if(!appScript.includes('const BT={'))throw new Error('Missing section renderers');
  appScript=appScript.replace('const BT={',countryBlock+'const BT={');
}
if(!appScript.includes('countrymap:s=>countryMapHTML(s),'))appScript=appScript.replace('const BT={','const BT={\ncountrymap:s=>countryMapHTML(s),');
// Keep partner locations on the Earth's surface rather than in a decorative orbit.
appScript = updatePartnerGlobe(appScript);
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
 else if(CUR==='partenaires')d={name:raw.name,email:raw.email,organization:raw.organization||'',type:'partnership',message:raw.message,consent:raw.consent==='on',locale};
 else if(CUR==='ressources')d={email:raw.email,type:'resources',consent:raw.consent==='on',locale};
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

// Keep the brand spelling in visible copy; lowercase filenames and legacy URLs stay stable.
html = html.replace(/Yidacashew|YIDA-CASHEW|Yida-Cashew|YIDA Cashew|Yida Cashew/gu, 'YIDA-Cashew');
html = html.replace('data-en="Projects" type="button">Projets</button>', 'data-en="Initiatives" type="button">Initiatives</button>');
html = html.replace('<h4 data-en="Programmes">Programmes</h4>', '<h4 data-en="Initiatives">Initiatives</h4>');
const footerExpertise = '<div><h4 data-en="Expertise">Expertises</h4>' + expertise.map(item =>
  '<a data-en="' + item.titleEn.replaceAll('&', '&amp;') + '" href="#p-' + item.slug + '">' + item.titleFr.replaceAll('&', '&amp;') + '</a>'
).join('') + '</div>';
html = html.replace(/<div><h4 data-en="Expertise">Expertises<\/h4>[\s\S]*?<\/div>/u, footerExpertise);
if (!html.includes('data-brand="yida-cashew"')) {
  html = html.replaceAll('>YIDA-Cashew<', ' data-brand="yida-cashew">YIDA-Cashew<');
}
if (!html.includes('[data-brand="yida-cashew"]{text-transform:none!important}')) {
  html = html.replace('</style>', '[data-brand="yida-cashew"]{text-transform:none!important}</style>');
}

// The team photo has a dark overlay; keep its copy readable in both languages.
const teamTextColors = '#sec-equipe.t-team.hasbg h2{color:#ffffff}#sec-equipe.t-team.hasbg .lead,#sec-equipe.t-team.hasbg .tr2 div>span{color:#e3efea}#sec-equipe.t-team.hasbg .tr2 b{color:#b7e6a5}';
if (!html.includes(teamTextColors)) html = html.replace('</style>', teamTextColors + '</style>');

if (!html.includes('src="editorial-client.js"')) html = html.replace('</body>', '<script src="editorial-client.js" defer></script></body>');
await writeFile(path.join(publicRoot,'style-policy.mjs'),await readFile(new URL('../pilot/cms/src/domain/style-policy.mjs',import.meta.url),'utf8'));
// Apply supplied illustrations after all editorial generators and preserve the approved layout.
const remapMatch = html.match(/window\.RES=(\{[^;]+\});/u);
if (!remapMatch) throw new Error('Missing maquette image remapping.');
const previousRemaps = JSON.parse(remapMatch[1]);
const nextRemaps = {...previousRemaps, ...visualFallbacks};
html = html.replace(remapMatch[0], 'window.RES=' + JSON.stringify(nextRemaps) + ';');
const heroStart = html.indexOf('const HOME_HERO=');
const heroEnd = html.indexOf('function heroHTML(', heroStart);
if (heroStart < 0 || heroEnd < 0) throw new Error('Missing home hero image.');
const heroChunk = html.slice(heroStart,heroEnd).replace(/--hero:url\('[^']+'\)/u, "--hero:url('" + visualPath(1) + "')");
html = html.slice(0,heroStart) + heroChunk + html.slice(heroEnd);
if(!html.includes('href="country-map.css"'))html=html.replace('</head>','<link rel="stylesheet" href="country-map.css"/></head>');
await writeFile(indexPath, html);
console.log(`Built the approved maquette page and updated validated content; ${imageFiles.size} embedded image assets externalized.`);
