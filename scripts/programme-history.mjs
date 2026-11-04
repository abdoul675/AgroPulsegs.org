// Editorial facts from the five-page October 2026 review and presentation dossier.
// Targets are deliberately kept separate from reported activity and measured results.
const local = (fr, en) => ({ fr, en });
const paragraph = (fr, en) => [local(fr, en)];
const card = (fr, en, textFr, textEn, image, icon = 'users') => ({
  title: local(fr, en), text: paragraph(textFr, textEn), image, icon, bullets: [], meta: [], points: [],
});

export function completeProgrammeHistory(pages) {
  const page = pages.fellowship;
  const parts = Object.fromEntries(page.sections.map(section => [section.id, section]));
  parts.genese.groups[0].text = paragraph(
    'En août 2025, Evariste Dongo rejoint GIZ-WEECAP, au Pilier 4, comme expert en Knowledge Management. Ancien ambassadeur de DCLI / « Des Chiffres et Des Jeunes » en Côte d’Ivoire, il échange avec des alumni et d’autres jeunes pour concevoir YIDA-Cashew.',
    'In August 2025, Evariste Dongo joins GIZ-WEECAP Pillar 4 as a Knowledge Management expert. A former DCLI / “Des Chiffres et Des Jeunes” ambassador in Côte d’Ivoire, he works with alumni and other young people to develop YIDA-Cashew.',
  );
  parts.genese.groups[1].text = paragraph(
    'Le 14 juillet 2026, les jeunes fondateurs créent AgroPulse Global Solutions à Abidjan pour améliorer l’écosystème des données agricoles et porter leur premier programme, YIDA-Cashew.',
    'On 14 July 2026, the young founders establish AgroPulse Global Solutions in Abidjan to improve the agricultural data ecosystem and lead their first programme, YIDA-Cashew.',
  );
  const development = {
    id: 'construction', type: 'timeline', kicker: local('La construction du programme', 'How the programme developed'),
    title: local('Une démarche construite avec les acteurs de la filière', 'A programme shaped with value-chain stakeholders'),
    lead: paragraph(
      'La revue d’octobre 2026 retrace les étapes de conception et de concertation. Ces étapes ne constituent pas un bilan de Fellows déjà formés.',
      'The October 2026 review documents programme design and consultation. These milestones are not a record of Fellows already trained.',
    ),
    groups: [
      card('Inscription au plan de travail', 'Inclusion in the work plan', 'Selon la revue, GIZ-WEECAP approuve l’initiative et l’inscrit au plan de travail du Pilier 4, sous les références 5.4.3, 5.4.5 et 5.2.2.', 'According to the review, GIZ-WEECAP approves the initiative and includes it in the Pillar 4 work plan under references 5.4.3, 5.4.5 and 5.2.2.', 'assets/maquette/5e318a446b0b773d56ab.webp', 'decision'),
      card('Mai–juin 2026 : écouter les besoins', 'May–June 2026: understanding needs', 'La revue rapporte l’adhésion de Winrock International et de CARE International, ainsi que leur appui à un sondage auprès de coopératives, d’unités de transformation et d’associations villageoises d’épargne et de crédit.', 'The review reports support from Winrock International and CARE International, including assistance with a survey of cooperatives, processing units and village savings and loan associations.', 'assets/maquette/8151fb887f84b8198878.webp'),
      card('Une gouvernance à préciser', 'Governance to be confirmed', 'GIZ-WEECAP, Winrock International et CARE International sont présentés dans la revue comme pressentis pour un comité scientifique et de pilotage. Sa composition définitive n’est pas annoncée ici.', 'The review describes GIZ-WEECAP, Winrock International and CARE International as prospective members of a scientific and steering committee. Its final membership is not announced here.', 'assets/maquette/6a106959e853926bbff9.webp'),
    ],
    ctas: [], meta: [],
  };
  parts.objectifs.lead = paragraph(
    'YIDA-Cashew vise à recruter, former et accompagner l’insertion de jeunes et de femmes du numérique dans la filière cajou. L’enjeu est de rapprocher les compétences disponibles des besoins réels des organisations.',
    'YIDA-Cashew aims to recruit, train and support the professional integration of young people and women in digital fields within the cashew value chain, connecting available skills with organisational needs.',
  );
  parts.objectifs.groups[0].text = paragraph('Former aux métiers de la donnée, de l’intelligence artificielle et des statistiques appliqués à l’agriculture, avec une perspective de certification.', 'Train in data, artificial intelligence and statistics applied to agriculture, with certification as an objective.');
  parts.anacarde.kicker = local('Une ambition pour 2030', 'An ambition for 2030');
  parts.anacarde.title = local('Objectif : 500+ Fellows formés et déployés d’ici 2030', 'Target: 500+ Fellows trained and deployed by 2030');
  parts.anacarde.lead = [
    local('La revue n° 01 présente cet effectif comme un objectif à l’horizon 2030. Il ne s’agit pas d’un nombre de bénéficiaires déjà formés ou déployés.', 'Issue 01 presents this number as a target for 2030. It is not a count of beneficiaries already trained or deployed.'),
    local('Le dossier de présentation envisage une cohorte pilote de 50 Fellows. Cet effectif relève de la planification : le nombre de places, le calendrier et les critères d’une prochaine cohorte restent à confirmer.', 'The presentation dossier envisages a pilot cohort of 50 Fellows. This is a planning figure: places, dates and eligibility criteria for a forthcoming cohort remain to be confirmed.'),
  ];
  const context = {
    id: 'contexte', type: 'text', title: local('Le contexte WEECAP', 'The WEECAP context'),
    lead: [
      local('La revue situe la genèse de YIDA-Cashew dans le programme WEECAP, auquel elle attribue une ambition de 330 000 emplois dignes pour les jeunes et les femmes dans la production et la transformation du cajou. Ce chiffre concerne WEECAP ; ce n’est ni un objectif de formation propre à YIDA-Cashew ni un résultat obtenu par AgroPulse.', 'The review places the origins of YIDA-Cashew within WEECAP, which it describes as aiming for 330,000 decent jobs for young people and women in cashew production and processing. This figure belongs to WEECAP; it is neither YIDA-Cashew’s own training target nor an AgroPulse achievement.'),
      local('YIDA-Cashew répond à un besoin spécifique : intégrer les métiers du numérique et de la donnée dans cette dynamique de développement agricole.', 'YIDA-Cashew addresses a specific need: bringing digital and data professions into this agricultural development effort.'),
    ], groups: [], ctas: [],
  };
  const origin = {
    id: 'sources', type: 'text', title: local('Repères et informations pratiques', 'Sources and practical information'),
    lead: [
      local('Cette présentation s’appuie sur La Revue YIDA-Cashew × AgroPulse n° 01, octobre 2026, et sur le dossier de présentation AgroPulse. Les objectifs et prévisions sont distingués des réalisations documentées.', 'This presentation draws on La Revue YIDA-Cashew × AgroPulse, Issue 01, October 2026, and the AgroPulse presentation dossier. Targets and forecasts are distinguished from documented activity.'),
      local('AgroPulse présente des pays d’intervention en Côte d’Ivoire, au Sénégal et en Guinée-Bissau. Cela ne signifie pas qu’une cohorte YIDA-Cashew est actuellement ouverte dans chacun de ces pays. Les candidatures restent fermées ; utilisez le formulaire ci-dessous pour demander des renseignements.', 'AgroPulse lists countries of intervention in Côte d’Ivoire, Senegal and Guinea-Bissau. This does not mean a YIDA-Cashew cohort is currently open in each country. Applications remain closed; use the form below to request information.'),
    ], groups: [], ctas: [],
  };
  page.sections = [parts.genese, development, parts.objectifs, parts.publics, parts.parcours, parts.appris, parts.anacarde, context, origin, parts.notif];
}
