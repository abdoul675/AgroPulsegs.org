// Current editorial decisions from the project owner, 4 November 2026.
const l = (fr, en) => ({ fr, en });
const service = (titleFr, titleEn, textFr, textEn) => ({ titleFr, titleEn, textFr, textEn });
export const expertiseAreas = [
  {
    titleFr: 'Formation et certification', titleEn: 'Training and certification',
    textFr: 'Développer les compétences en données, intelligence artificielle et statistiques appliquées à l’agriculture.',
    textEn: 'Develop skills in data, artificial intelligence and statistics applied to agriculture.',
    details: [
      service('Formation aux métiers du numérique', 'Digital skills training', 'Parcours de formation en données, IA et statistiques pour les acteurs agricoles.', 'Training in data, AI and statistics for agricultural stakeholders.'),
      service('Certification et compétences', 'Certification and skills', 'Certification et renforcement des compétences des jeunes et des équipes.', 'Certification and skills development for young people and existing teams.'),
    ],
  },
  {
    titleFr: 'Systèmes d’information et gouvernance des données', titleEn: 'Information systems and data governance',
    textFr: 'Structurer les données agricoles et concevoir les applications, plateformes et règles nécessaires à leur gestion.',
    textEn: 'Structure agricultural data and design the applications, platforms and rules needed to manage it.',
    details: [
      service('Applications et plateformes', 'Applications and platforms', 'Diagnostic, cartographie, développement et modernisation des systèmes d’information agricoles.', 'Diagnostics, mapping, development and modernisation of agricultural information systems.'),
      service('Gouvernance des données', 'Data governance', 'Organisation des données, protocoles de partage et politiques de gestion adaptées aux filières.', 'Data organisation, sharing protocols and management policies adapted to agricultural value chains.'),
    ],
  },
  {
    titleFr: 'Intelligence artificielle et analyse de données', titleEn: 'Artificial intelligence and data analytics',
    textFr: 'Transformer les données en prévisions, tableaux de bord et outils d’aide à la décision.',
    textEn: 'Turn data into forecasts, dashboards and decision-support tools.',
    details: [
      service('Prévisions agricoles', 'Agricultural forecasting', 'Analyse et modélisation des prix et des rendements agricoles.', 'Analysis and modelling of agricultural prices and yields.'),
      service('Aide à la décision', 'Decision support', 'Tableaux de bord, analyses et publications sectorielles pour éclairer les décisions.', 'Dashboards, analytics and sector publications to inform decisions.'),
    ],
  },
  {
    titleFr: 'Climat, durabilité et finance verte', titleEn: 'Climate, sustainability and green finance',
    textFr: 'Accompagner la mesure des impacts, la traçabilité, l’adaptation climatique et les démarches de financement vert.',
    textEn: 'Support impact measurement, traceability, climate adaptation and green finance initiatives.',
    details: [
      service('Mesure et durabilité', 'Measurement and sustainability', 'Mesure carbone, suivi des impacts, démarches ESG et traçabilité durable.', 'Carbon measurement, impact monitoring, ESG practices and sustainable traceability.'),
      service('Adaptation et finance verte', 'Adaptation and green finance', 'Cartographie des risques, plans d’adaptation et accompagnement des dossiers de financement climatique.', 'Risk mapping, adaptation plans and support with climate finance proposals.'),
    ],
  },
  {
    titleFr: 'Incubation et entrepreneuriat agri-tech', titleEn: 'Agri-tech incubation and entrepreneurship',
    textFr: 'Accompagner les porteurs de projets et startups agricoles du modèle économique au développement de leur activité.',
    textEn: 'Support agricultural founders and startups from business models to business development.',
    details: [
      service('Incubation et accélération', 'Incubation and acceleration', 'Accompagnement des modèles d’affaires et développement des projets numériques agricoles.', 'Support for business models and agricultural digital ventures.'),
      service('Mentorat et financement', 'Mentoring and finance', 'Mentorat sectoriel et mise en relation avec les investisseurs et les dispositifs d’amorçage.', 'Sector mentoring and connections with investors and early-stage funding programmes.'),
    ],
  },
  {
    titleFr: 'Conseil stratégique et études', titleEn: 'Strategic consulting and studies',
    textFr: 'Éclairer les orientations des organisations par des diagnostics, études et évaluations de programmes.',
    textEn: 'Inform organisational strategy through diagnostics, studies and programme evaluations.',
    details: [
      service('Diagnostics et faisabilité', 'Diagnostics and feasibility', 'Études de marché, diagnostics sectoriels et études de faisabilité.', 'Market studies, sector diagnostics and feasibility studies.'),
      service('Stratégie et évaluation', 'Strategy and evaluation', 'Conseil en politique de digitalisation, évaluation et capitalisation des programmes.', 'Advice on digitalisation policies, programme evaluation and knowledge sharing.'),
    ],
  },
  {
    titleFr: 'Mobilisation d’experts et services externalisés', titleEn: 'Expert mobilisation and outsourced services',
    textFr: 'Mettre des professionnels qualifiés à disposition des organisations et accompagner leurs opérations numériques.',
    textEn: 'Provide organisations with qualified professionals and support their digital operations.',
    details: [
      service('Experts et équipes qualifiées', 'Qualified experts and teams', 'Mobilisation de techniciens, développeurs, analystes et spécialistes métier selon les besoins.', 'Mobilisation of technicians, developers, analysts and sector specialists according to needs.'),
      service('Services externalisés', 'Outsourced services', 'Gestion opérationnelle de systèmes d’information et appui aux équipes, avec des compétences en QHSE, genre et inclusion.', 'Operational information-system management and team support, including expertise in QHSE, gender and inclusion.'),
    ],
  },
  {
    titleFr: 'Mécanisation agricole', titleEn: 'Agricultural mechanisation',
    textFr: 'Accompagner le choix, l’utilisation durable, la maintenance et le financement des équipements agricoles.',
    textEn: 'Support equipment selection, sustainable operation, maintenance and agricultural equipment financing.',
    details: [
      service('Équipements et exploitation durable', 'Equipment and sustainable operation', 'Diagnostic des besoins, conseil sur le choix des équipements et appui à la maintenance.', 'Needs assessment, advice on equipment selection and maintenance support.'),
      service('Services locaux et financement', 'Local services and financing', 'Développement des capacités locales, mutualisation des équipements et accompagnement de l’accès au financement.', 'Local capacity development, shared equipment and support with access to finance.'),
    ],
  },
].map((area, index) => ({ ...area, slug: `pole-${index + 1}`, href: `#p-pole-${index + 1}` }));

const group = (fr, en, textFr, textEn, image, icon = 'data') => ({
  title: l(fr, en), text: [l(textFr, textEn)], image, icon, bullets: [], meta: [], points: [],
});

export function applyProgrammeContent(pages) {
  const page = pages.fellowship;
  const sections = Object.fromEntries(page.sections.map(section => [section.id, section]));
  page.title = l('YIDA-Cashew', 'YIDA-Cashew');
  page.hero.title = l('YIDA-Cashew', 'YIDA-Cashew');
  page.hero.eyebrow = l('Programme jeunesse', 'Youth programme');
  page.hero.lead = [l(
    'Youth in Data for Agriculture – Cashew : un programme pour développer les compétences des jeunes et des femmes dans les métiers de la donnée, au service de la filière cajou.',
    'Youth in Data for Agriculture – Cashew: a programme developing young people’s and women’s data skills to support the cashew value chain.',
  )];
  page.hero.ctas = [{ label: l('Demander des renseignements', 'Request information'), to: '#sec-notif' }];
  sections.genese.title = l('Relier les talents aux besoins de la filière', 'Connecting talent with value-chain needs');
  sections.genese.lead = [l(
    'YIDA-Cashew est né d’un constat : des jeunes formés aux données cherchent des débouchés, tandis que les acteurs de la filière cajou ont besoin de compétences numériques et de données fiables.',
    'YIDA-Cashew grew from a shared challenge: young people trained in data seek opportunities, while cashew stakeholders need digital skills and reliable information.',
  )];
  sections.genese.groups = [
    group('Une initiative portée par des jeunes', 'A youth-led initiative', 'Des alumni de DCLI / « Des Chiffres et Des Jeunes » et d’autres jeunes ont contribué à concevoir ce programme à partir de leur expérience.', 'DCLI / “Des Chiffres et Des Jeunes” alumni and other young people helped design the programme based on their own experience.', 'assets/maquette/6a106959e853926bbff9.webp', 'users'),
    group('Un premier programme pour AgroPulse', 'A first programme for AgroPulse', 'AgroPulse Global Solutions porte YIDA-Cashew pour relier le développement des talents à l’amélioration de l’écosystème des données agricoles.', 'AgroPulse Global Solutions leads YIDA-Cashew to connect talent development with a stronger agricultural data ecosystem.', 'assets/maquette/5e318a446b0b773d56ab.webp'),
  ];
  const objectives = {
    id: 'objectifs', type: 'features', title: l('Ce que le programme vise', 'What the programme aims to achieve'), lead: [],
    groups: [
      group('Développer les compétences', 'Develop skills', 'Former aux données, aux statistiques et aux outils numériques appliqués aux réalités agricoles.', 'Build data, statistics and digital skills grounded in agricultural realities.', 'assets/maquette/60540953ca60fd272ab6.webp', 'learn'),
      group('Renforcer les structures de la filière', 'Strengthen value-chain organisations', 'Préparer des profils capables d’appuyer la collecte, l’organisation et l’utilisation des données au sein des structures de la filière cajou.', 'Prepare professionals to support data collection, organisation and use within cashew value-chain organisations.', 'assets/maquette/5e318a446b0b773d56ab.webp'),
      group('Accompagner l’insertion professionnelle', 'Support professional integration', 'Favoriser les liens entre les talents formés et les besoins des organisations, sans garantie d’embauche.', 'Connect trained talent with organisational needs, without a job guarantee.', 'assets/maquette/e307ce8d98bf85b18fb7.webp', 'job'),
    ],
  };
  const audiences = {
    id: 'publics', type: 'tiles', small: false, title: l('À qui s’adresse YIDA-Cashew ?', 'Who is YIDA-Cashew for?'),
    lead: [l('Les critères détaillés de sélection seront précisés avant une ouverture des candidatures.', 'Detailed selection criteria will be specified before applications open.')],
    groups: [
      group('Jeunes et femmes du numérique', 'Young people and women in digital fields', 'Des personnes souhaitant développer et appliquer leurs compétences en données dans le secteur agricole.', 'People seeking to develop and apply data skills in agriculture.', 'assets/maquette/889bc67b5de174597d80.webp', 'users'),
      group('Acteurs de la filière cajou', 'Cashew value-chain stakeholders', 'Coopératives, unités de transformation et autres structures ayant des besoins en données et en compétences numériques.', 'Cooperatives, processing units and other organisations with data and digital skills needs.', 'assets/maquette/8151fb887f84b8198878.webp'),
    ],
  };
  sections.parcours.kicker = l('Le parcours', 'The pathway');
  sections.parcours.title = l('De la formation à la mise en pratique', 'From learning to practice');
  sections.parcours.lead = [l('Le programme prévoit 2 à 3 mois de formation. Les modalités de déploiement et le calendrier restent à confirmer.', 'The programme provides for two to three months of training. Deployment arrangements and the schedule remain to be confirmed.')];
  sections.parcours.groups[0].text = [l('Acquérir les bases et les méthodes des métiers de la donnée appliqués à l’agriculture.', 'Learn the foundations and methods of data work applied to agriculture.')];
  sections.parcours.groups[1].text = [l('Mettre les compétences au service des besoins concrets de la filière cajou.', 'Apply skills to practical needs in the cashew value chain.')];
  sections.parcours.groups[2].text = [l('La certification et l’accompagnement vers les structures de la filière font partie des objectifs du programme, sans promesse d’emploi.', 'Certification and support towards value-chain organisations are programme objectives, without an employment promise.')];
  sections.anacarde.title = l('La donnée au service de la filière cajou', 'Data for the cashew value chain');
  sections.anacarde.lead = [l('Mieux produire, organiser et utiliser l’information pour éclairer les décisions des acteurs de la filière.', 'Improve how information is produced, organised and used to inform decisions across the value chain.')];
  sections.notif.title = l('Se renseigner sur YIDA-Cashew', 'Ask about YIDA-Cashew');
  sections.notif.lead = [l('Ce formulaire permet de demander des renseignements. Il ne constitue pas une candidature : les candidatures sont actuellement fermées.', 'Use this form to request information. It is not an application: applications are currently closed.')];
  page.sections = [sections.genese, objectives, audiences, sections.parcours, sections.appris, sections.anacarde, sections.notif];

  const resources = pages.ressources;
  resources.title = l('Ressources', 'Resources');
  resources.hero.title = l('Ressources et informations', 'Resources and information');
  resources.hero.eyebrow = l('En savoir plus', 'Learn more');
  resources.hero.lead = [l('Les informations sur nos initiatives sont disponibles directement sur leurs pages de présentation.', 'Information about our initiatives is available directly on their presentation pages.')];
  resources.hero.variant = '';
  const examples = resources.sections.find(section => section.id === 'exemples');
  Object.assign(examples, {
    type: 'links', kicker: l('Nos initiatives', 'Our initiatives'), title: l('Découvrir nos programmes', 'Explore our programmes'),
    lead: [l('Aucun document n’est actuellement proposé au téléchargement. Retrouvez les informations utiles sur les pages ci-dessous.', 'No documents are currently available for download. Find useful information on the pages below.')],
    groups: [
      { title: l('YIDA-Cashew', 'YIDA-Cashew'), text: [l('Compétences en données et accompagnement des talents pour la filière cajou.', 'Data skills and talent development for the cashew value chain.')], to: 'fellowship' },
      { title: l('AGIR-IA', 'AGIR-IA'), text: [l('Une initiative distincte autour de l’intelligence artificielle et des femmes agripreneures.', 'A separate initiative focused on artificial intelligence and women agripreneurs.')], to: 'agir-ia' },
    ],
  });
}
