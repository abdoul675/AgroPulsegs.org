import { writeFile } from 'node:fs/promises';

const root = new URL('../public/', import.meta.url);
const escape = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
const text = (tag, fr, en, className = '') =>
  `<${tag}${className ? ` class="${className}"` : ''} data-fr="${escape(fr)}" data-en="${escape(en)}">${escape(fr)}</${tag}>`;
const image = (src, fr, en, className = '') => {
  const eager = className === 'hero-image';
  return `<img src="${src}" alt="${escape(fr)}" data-alt-fr="${escape(fr)}" data-alt-en="${escape(en)}" width="1100" height="618" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async"${className ? ` class="${className}"` : ''}>`;
};
const link = (href, fr, en, className = 'button') =>
  `<a class="${className}" href="${href}" data-fr="${escape(fr)}" data-en="${escape(en)}">${escape(fr)}</a>`;

const expertise = [
  {
    id: 'pole-1',
    image: 'pole-01.webp',
    fr: 'Formation, emploi et talents numériques',
    en: 'Digital training, employment and talent',
    altFr: 'Formation de jeunes aux outils numériques.',
    altEn: 'Young people learning digital tools.',
    descriptionFr: 'Formation, certification, placement et renforcement des capacités numériques.',
    descriptionEn: 'Training, certification, placement and digital capacity building.',
  },
  {
    id: 'pole-2',
    image: 'pole-02.webp',
    fr: 'SI agricoles et gouvernance des données',
    en: 'Agricultural information systems and data governance',
    altFr: 'Outils numériques et collecte de données sur le terrain.',
    altEn: 'Digital tools and field data collection.',
    descriptionFr: 'Diagnostic, cartographie, applications, portails et politiques de gouvernance des données.',
    descriptionEn: 'Diagnostics, data mapping, applications, portals and data governance policies.',
  },
  {
    id: 'pole-3',
    image: 'pole-03.webp',
    fr: 'IA et Data Analytics',
    en: 'AI and data analytics',
    altFr: 'Analyse visuelle de données agricoles.',
    altEn: 'Visual analysis of agricultural data.',
    descriptionFr: 'Prévisions de prix et de rendements, aide à la décision, tableaux de bord et publications.',
    descriptionEn: 'Price and yield forecasting, decision support, dashboards and publications.',
  },
  {
    id: 'pole-4',
    image: 'pole-04.webp',
    fr: 'Climat, économie verte et finance climatique',
    en: 'Climate, green economy and climate finance',
    altFr: 'Suivi d’une exploitation agricole avec des outils numériques.',
    altEn: 'Monitoring a farm with digital tools.',
    descriptionFr: 'Mesure, carbone, ESG, traçabilité, finance verte, risques et adaptation.',
    descriptionEn: 'Measurement, carbon, ESG, traceability, green finance, risks and adaptation.',
  },
  {
    id: 'pole-5',
    image: 'pole-05.webp',
    fr: 'Incubation et startups agri-tech',
    en: 'Agri-tech incubation and startups',
    altFr: 'Équipe travaillant sur une solution agricole innovante.',
    altEn: 'A team working on an agricultural innovation.',
    descriptionFr: 'Modèles d’affaires, incubation, accélération, mentorat et mise en relation.',
    descriptionEn: 'Business models, incubation, acceleration, mentoring and connections.',
  },
  {
    id: 'pole-6',
    image: 'pole-08.webp',
    fr: 'Conseil stratégique, études et mécanisation',
    en: 'Strategic consulting, studies and mechanization',
    altFr: 'Matériel de mécanisation dans une exploitation agricole.',
    altEn: 'Mechanization equipment on a farm.',
    descriptionFr: 'Diagnostics, faisabilité, politiques de digitalisation, études de marché et mécanisation.',
    descriptionEn: 'Diagnostics, feasibility, digitalization policies, market studies and mechanization.',
  },
];

const nav = [
  ['index.html', 'Accueil', 'Home'],
  ['apropos.html', 'À propos', 'About'],
  ['expertises.html', 'Expertises', 'Expertise'],
  ['yida-cashew.html', 'YIDA-Cashew', 'YIDA-Cashew'],
  ['agir-ia.html', 'AGIR-IA', 'AGIR-IA'],
  ['contact.html', 'Contact', 'Contact'],
];

const pages = [
  {
    file: 'apropos.html',
    titleFr: 'À propos',
    titleEn: 'About AgroPulse',
    descFr: 'AgroPulse Global Solutions accompagne la transformation des filières agricoles.',
    descEn: 'AgroPulse Global Solutions supports the transformation of agricultural value chains.',
    heroFr: 'Des réalités de terrain aux solutions numériques.',
    heroEn: 'From local realities to digital solutions.',
    introFr: 'AgroPulse Global Solutions accompagne les filières agricoles avec du conseil, des systèmes d’information et des services numériques.',
    introEn: 'AgroPulse Global Solutions supports agricultural value chains through consulting, information systems and digital services.',
    heroImage: 'pole-05.webp',
    heroAltFr: 'Une équipe échange autour d’une solution agricole.',
    heroAltEn: 'A team discusses an agricultural solution.',
    sections: `<section class="intro-section content-wrap page-intro">
      <div class="intro-heading"><p class="eyebrow">AGROPULSE GLOBAL SOLUTIONS</p><h2 data-fr="Le numérique au service des filières agricoles." data-en="Digital solutions for agricultural value chains.">Le numérique au service des filières agricoles.</h2></div>
      <div class="intro-copy"><p data-fr="Conseil et solutions numériques pour accompagner la transformation digitale et verte de l’agriculture." data-en="Consulting and digital solutions supporting the digital and green transformation of agriculture.">Conseil et solutions numériques pour accompagner la transformation digitale et verte de l’agriculture.</p><p class="location-note" data-fr="Pays d’intervention indiqués : Côte d’Ivoire, Sénégal et Guinée-Bissau." data-en="Countries of intervention listed: Côte d’Ivoire, Senegal and Guinea-Bissau.">Pays d’intervention indiqués : Côte d’Ivoire, Sénégal et Guinée-Bissau.</p></div>
    </section>
    <section class="page-band"><div class="content-wrap page-band-inner"><p class="eyebrow" data-fr="NOTRE APPROCHE" data-en="OUR APPROACH">NOTRE APPROCHE</p><h2 data-fr="Conseil · données · innovation" data-en="Consulting · data · innovation">Conseil · données · innovation</h2><p data-fr="Une offre articulée autour de six pôles complémentaires, présentés sur la page Expertises." data-en="An offer built around six complementary areas of expertise, presented on the Expertise page.">Une offre articulée autour de six pôles complémentaires, présentés sur la page Expertises.</p>${link('expertises.html', 'Découvrir les expertises ↗', 'Explore our expertise ↗')}</div></section>`,
  },
  {
    file: 'expertises.html',
    titleFr: 'Expertises',
    titleEn: 'Expertise',
    descFr: 'Les six pôles d’expertise d’AgroPulse Global Solutions.',
    descEn: 'The six areas of expertise at AgroPulse Global Solutions.',
    heroFr: 'Six pôles complémentaires.',
    heroEn: 'Six complementary areas of expertise.',
    introFr: 'Des compétences en formation, données, climat, innovation et conseil stratégique pour les filières agricoles.',
    introEn: 'Expertise in training, data, climate, innovation and strategic consulting for agricultural value chains.',
    heroImage: 'pole-03.webp',
    heroAltFr: 'Analyse de données agricoles.',
    heroAltEn: 'Agricultural data analysis.',
    sections: `<section class="expertise-section page-expertise"><div class="content-wrap">
      <div class="section-heading"><div><p class="eyebrow" data-fr="NOS DOMAINES D’INTERVENTION" data-en="OUR AREAS OF WORK">NOS DOMAINES D’INTERVENTION</p><h2 data-fr="De la stratégie au terrain." data-en="From strategy to the field.">De la stratégie au terrain.</h2></div></div>
      <div class="expertise-grid">${expertise.map((item, index) => `<article class="expertise-card" id="${item.id}"><div class="card-image">${image(`assets/home/${item.image}`, item.altFr, item.altEn)}<span>0${index + 1}</span></div><div class="card-copy"><h3>${text('span', item.fr, item.en)}</h3><p>${text('span', item.descriptionFr, item.descriptionEn)}</p></div></article>`).join('')}</div>
      <div class="page-cta">${link('contact.html', 'Discuter de votre projet ↗', 'Discuss your project ↗')}</div>
    </div></section>`,
  },
  {
    file: 'yida-cashew.html',
    titleFr: 'YIDA-Cashew',
    titleEn: 'YIDA-Cashew',
    descFr: 'YIDA-Cashew, parcours de formation aux données agricoles.',
    descEn: 'YIDA-Cashew, a training pathway in agricultural data.',
    heroFr: 'YIDA-Cashew · les données au service de la filière cajou.',
    heroEn: 'YIDA-Cashew · data for the cashew value chain.',
    introFr: 'Un parcours de formation consacré aux métiers de la donnée appliqués à l’agriculture et à la filière cajou.',
    introEn: 'A training pathway focused on data skills for agriculture and the cashew value chain.',
    heroImage: 'pole-01.webp',
    heroAltFr: 'Formation aux outils numériques.',
    heroAltEn: 'Training in digital tools.',
    sections: `<section class="program-section content-wrap page-program">
      <article class="program-card fellowship-card"><p class="program-label">FELLOWSHIP · YIDA-CASHEW</p><h2 data-fr="Apprendre et développer des compétences." data-en="Learn and build skills.">Apprendre et développer des compétences.</h2><p data-fr="Le cahier des charges prévoit 2 à 3 mois de formation. Les informations disponibles mentionnent également la certification et un accompagnement vers l’emploi, sans garantie d’embauche." data-en="The requirements describe two to three months of training. Available information also mentions certification and support towards employment, without a job guarantee.">Le cahier des charges prévoit 2 à 3 mois de formation. Les informations disponibles mentionnent également la certification et un accompagnement vers l’emploi, sans garantie d’embauche.</p><p class="status-label"><span class="status-dot" aria-hidden="true"></span><span data-fr="Candidatures fermées · calendrier et critères à confirmer" data-en="Applications closed · schedule and criteria to be confirmed">Candidatures fermées · calendrier et critères à confirmer</span></p></article>
    </section><section class="page-band"><div class="content-wrap page-band-inner"><p class="eyebrow" data-fr="POUR EN SAVOIR PLUS" data-en="FIND OUT MORE">POUR EN SAVOIR PLUS</p><h2 data-fr="Une question sur le programme ?" data-en="Questions about the program?">Une question sur le programme ?</h2>${link('contact.html', 'Contacter AgroPulse ↗', 'Contact AgroPulse ↗')}</div></section>`,
  },
  {
    file: 'agir-ia.html',
    titleFr: 'AGIR-IA',
    titleEn: 'AGIR-IA',
    descFr: 'AGIR-IA, programme AgroPulse distinct du Fellowship YIDA-Cashew.',
    descEn: 'AGIR-IA, an AgroPulse program separate from the YIDA-Cashew Fellowship.',
    heroFr: 'AGIR-IA · une initiative distincte.',
    heroEn: 'AGIR-IA · a distinct initiative.',
    introFr: 'AGIR-IA est présenté séparément du Fellowship YIDA-Cashew. La Fondation AWI est identifiée comme partenaire confirmé.',
    introEn: 'AGIR-IA is presented separately from the YIDA-Cashew Fellowship. The AWI Foundation is identified as a confirmed partner.',
    heroImage: 'agir-ia.webp',
    heroAltFr: 'Visuel illustratif d’une formation numérique destinée aux agripreneures.',
    heroAltEn: 'Illustrative visual of digital training for women agripreneurs.',
    sections: `<section class="intro-section content-wrap page-intro">
      <div class="intro-heading"><p class="eyebrow">AGIR-IA</p><h2 data-fr="Intelligence artificielle et entrepreneuriat agricole." data-en="Artificial intelligence and agricultural entrepreneurship.">Intelligence artificielle et entrepreneuriat agricole.</h2></div>
      <div class="intro-copy"><p data-fr="AGIR-IA est distinct du programme YIDA-Cashew. La Fondation AWI est le partenaire indiqué comme confirmé dans les informations disponibles." data-en="AGIR-IA is distinct from YIDA-Cashew. The AWI Foundation is the partner identified as confirmed in the available information.">AGIR-IA est distinct du programme YIDA-Cashew. La Fondation AWI est le partenaire indiqué comme confirmé dans les informations disponibles.</p><p class="location-note" data-fr="Le contenu détaillé des sessions et les suites du programme seront publiés après confirmation." data-en="Details of sessions and future program activities will be published once confirmed.">Le contenu détaillé des sessions et les suites du programme seront publiés après confirmation.</p></div>
    </section>`,
  },
  {
    file: 'contact.html',
    titleFr: 'Contact',
    titleEn: 'Contact',
    descFr: 'Contacter AgroPulse Global Solutions au sujet de votre projet.',
    descEn: 'Contact AgroPulse Global Solutions about your project.',
    heroFr: 'Parlons de votre projet.',
    heroEn: 'Let’s discuss your project.',
    introFr: 'Présentez votre besoin et préparez un brouillon de demande. Dans cette version, rien n’est transmis.',
    introEn: 'Describe your needs and prepare a request draft. Nothing is sent in this version.',
    heroImage: 'pole-05.webp',
    heroAltFr: 'Échange autour d’un projet agricole.',
    heroAltEn: 'A discussion about an agricultural project.',
    sections: `<section class="contact-section content-wrap page-contact">
      <div><p class="eyebrow" data-fr="VOTRE DEMANDE" data-en="YOUR REQUEST">VOTRE DEMANDE</p><h2 data-fr="Préparer un message pour AgroPulse" data-en="Prepare a message for AgroPulse">Préparer un message pour AgroPulse</h2><p class="contact-note" data-fr="Les coordonnées officielles et le destinataire des demandes restent à confirmer. Ce formulaire prépare un brouillon local et n’envoie aucun message." data-en="Official contact details and request recipients are still to be confirmed. This form prepares a local draft and sends no message.">Les coordonnées officielles et le destinataire des demandes restent à confirmer. Ce formulaire prépare un brouillon local et n’envoie aucun message.</p></div>
      <form class="request-form" id="request-form">
        <label for="contact-name" data-fr="Nom" data-en="Name">Nom</label><input id="contact-name" name="name" autocomplete="name" required>
        <label for="contact-email" data-fr="Adresse e-mail" data-en="Email address">Adresse e-mail</label><input id="contact-email" name="email" type="email" autocomplete="email" required>
        <label for="contact-organization" data-fr="Organisation (facultatif)" data-en="Organization (optional)">Organisation (facultatif)</label><input id="contact-organization" name="organization" autocomplete="organization">
        <label for="contact-type" data-fr="Objet de la demande" data-en="Request type">Objet de la demande</label><select id="contact-type" name="type"><option value="contact" data-fr="Prise de contact" data-en="General enquiry">Prise de contact</option><option value="quote" data-fr="Demande de devis" data-en="Quote request">Demande de devis</option></select>
        <label for="contact-message" data-fr="Votre message" data-en="Your message">Votre message</label><textarea id="contact-message" name="message" rows="5" maxlength="5000" required></textarea>
        <button class="button button-light" type="submit" data-fr="Préparer le brouillon" data-en="Prepare draft">Préparer le brouillon</button>
        <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
        <label for="request-draft" data-fr="Brouillon à copier" data-en="Draft to copy" hidden id="draft-label">Brouillon à copier</label><textarea id="request-draft" readonly hidden rows="7"></textarea>
      </form>
    </section>`,
  },
];

function renderPage(page) {
  const navLinks = nav.map(([href, fr, en]) =>
    `<a href="${href}"${href === page.file ? ' aria-current="page"' : ''} data-fr="${escape(fr)}" data-en="${escape(en)}">${escape(fr)}</a>`).join('');
  const menu = page.file === 'contact.html' ? ['contact.html', 'Parlons de votre projet ↗', 'Discuss your project ↗'] : null;
  const actions = menu ? link(menu[0], menu[1], menu[2], 'button nav-contact') : '';
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(page.descFr)}" data-description-fr="${escape(page.descFr)}" data-description-en="${escape(page.descEn)}">
  <meta name="theme-color" content="#123c31">
  <title>${escape(page.titleFr)} — AgroPulse Global Solutions</title>
  <link rel="stylesheet" href="homepage.css">
  <link rel="stylesheet" href="site-pages.css">
  <script src="site-pages.js" defer></script>
</head>
<body data-title-fr="${escape(page.titleFr)} — AgroPulse Global Solutions" data-title-en="${escape(page.titleEn)} — AgroPulse Global Solutions">
  <a class="skip-link" href="#main" data-fr="Aller au contenu" data-en="Skip to content">Aller au contenu</a>
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="AgroPulse Global Solutions"><span class="brand-name">AgroPulse</span><span class="brand-subtitle">Global Solutions</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" data-fr="Menu" data-en="Menu">Menu</button>
    <nav class="primary-navigation" id="primary-navigation" aria-label="Navigation principale" data-label-fr="Navigation principale" data-label-en="Main navigation">
      ${navLinks}
      <button class="language-switch" id="language-switch" type="button" aria-label="Passer en anglais" data-label-fr="Passer en anglais" data-label-en="Switch to French">EN</button>
    </nav>
  </header>
  <main id="main">
    <section class="hero subpage-hero" aria-labelledby="page-title">
      ${image(`assets/home/${page.heroImage}`, page.heroAltFr, page.heroAltEn, 'hero-image')}
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="hero-content">
        <p class="eyebrow hero-eyebrow">AGROPULSE GLOBAL SOLUTIONS</p>
        <h1 id="page-title" data-fr="${escape(page.heroFr)}" data-en="${escape(page.heroEn)}">${escape(page.heroFr)}</h1>
        <p class="hero-description" data-fr="${escape(page.introFr)}" data-en="${escape(page.introEn)}">${escape(page.introFr)}</p>
      </div>
    </section>
    ${page.sections}
  </main>
  <footer class="site-footer">
    <div class="content-wrap footer-main">
      <a class="brand footer-brand" href="index.html"><span class="brand-name">AgroPulse</span><span class="brand-subtitle">Global Solutions</span></a>
      <p data-fr="Données · Agriculture · Numérique" data-en="Data · Agriculture · Digital">Données · Agriculture · Numérique</p>
      <a class="back-top" href="#main" data-fr="Retour en haut ↑" data-en="Back to top ↑">Retour en haut ↑</a>
    </div>
    <div class="content-wrap footer-bottom"><span>© 2026 AgroPulse Global Solutions</span><span data-fr="Côte d’Ivoire · Sénégal · Guinée-Bissau" data-en="Côte d’Ivoire · Senegal · Guinea-Bissau">Côte d’Ivoire · Sénégal · Guinée-Bissau</span></div>
  </footer>
</body>
</html>`;
}

for (const page of pages) {
  await writeFile(new URL(page.file, root), renderPage(page), 'utf8');
}
