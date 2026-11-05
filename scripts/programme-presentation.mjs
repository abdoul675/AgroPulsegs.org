const l = (fr, en) => ({fr, en});
const p = (fr, en) => [l(fr, en)];
const card = (fr, en, textFr, textEn) => ({title:l(fr,en),text:p(textFr,textEn),bullets:[],meta:[],points:[]});

// Public programme information: confirmed activity stays distinct from future targets.
export function improveProgrammePresentation(pages) {
  const yida = pages.fellowship;
  const sections = Object.fromEntries(yida.sections.map(s => [s.id,s]));
  yida.hero.notice = l('Candidatures fermées', 'Applications closed');
  yida.hero.ctas = [
    {label:l('Découvrir le parcours','Explore the pathway'),to:'#sec-parcours'},
    {label:l('Demander des renseignements','Request information'),to:'#sec-notif'},
  ];
  Object.assign(sections.appris, {
    variant:'programme-facts', kicker:l('Le programme en bref','Programme at a glance'),
    title:l('Les repères essentiels','Key information'),
    lead:p('Un parcours consacré aux métiers de la donnée dans la filière cajou. Les effectifs ci-dessous sont des objectifs, pas des résultats déjà obtenus.','A pathway focused on data professions in the cashew value chain. The figures below are targets, not results already achieved.'),
    groups:[
      card('2 à 3 mois','2–3 months','Durée de formation annoncée dans le dossier de présentation.','Training duration stated in the presentation dossier.'),
      card('50 Fellows','50 Fellows','Cohorte pilote envisagée. Le nombre de places et le calendrier restent à confirmer.','Planned pilot cohort. Available places and dates remain to be confirmed.'),
      card('1 000 personnes','1,000 people','Objectif actualisé : former 1 000 personnes dans les filières agricoles d’ici 2030.','Updated target: train 1,000 people in agricultural value chains by 2030.'),
      card('Candidatures fermées','Applications closed','Aucune inscription n’est ouverte. Le formulaire permet de demander des renseignements.','Applications are not open. The form is for information requests.'),
    ],
  });
  Object.assign(sections.sources, {
    type:'programmefaq',
    lead:sections.sources.lead.slice(0,1),
    groups:[
      card('Comment candidater ?','How do I apply?','Les candidatures sont fermées. Les critères, les dates et les modalités d’une prochaine cohorte seront communiqués après validation. Vous pouvez demander des renseignements avec le formulaire ci-dessous.','Applications are closed. Eligibility, dates and application procedures for a future cohort will be shared once approved. You can request information using the form below.'),
      card('Dans quels pays ?','In which countries?','AgroPulse indique la Côte d’Ivoire, le Sénégal et la Guinée-Bissau comme pays d’intervention. Cela ne signifie pas qu’une cohorte YIDA-Cashew est ouverte dans chacun de ces pays.','AgroPulse lists Côte d’Ivoire, Senegal and Guinea-Bissau as countries of intervention. This does not mean a YIDA-Cashew cohort is open in each country.'),
      card('Les effectifs annoncés sont-ils déjà atteints ?','Have the announced figures already been achieved?','Non. Les 50 Fellows correspondent à une cohorte pilote envisagée, et les 1 000 personnes à l’objectif de formation actualisé pour 2030. Ces chiffres ne constituent pas un bilan de personnes déjà formées.','No. The 50 Fellows refer to a planned pilot cohort, and 1,000 people to the updated training target for 2030. These figures are not a count of people already trained.'),
    ],
  });
  sections.anacarde.title=l('Objectif : 1 000 personnes formées d’ici 2030','Target: 1,000 people trained by 2030');
  sections.anacarde.lead[0]=l('AgroPulse actualise son ambition : former 1 000 personnes dans les filières agricoles d’ici 2030, avec la filière cajou comme point d’ancrage. Cet objectif remplace la projection initiale de 500+ Fellows présentée dans la revue d’octobre 2026 ; il ne s’agit pas d’un résultat déjà obtenu.','AgroPulse has updated its ambition: train 1,000 people in agricultural value chains by 2030, with cashew as its starting point. This target replaces the initial projection of 500+ Fellows in the October 2026 review; it is not a result already achieved.');
  yida.sections = ['appris','objectifs','publics','parcours','anacarde','genese','construction','contexte','sources','notif'].map(id=>sections[id]);

  const agir = pages['agir-ia'];
  const a = Object.fromEntries(agir.sections.map(s=>[s.id,s]));
  agir.hero.eyebrow = l('Femmes & entrepreneuriat agricole','Women & agricultural entrepreneurship');
  agir.hero.notice = l('Session réalisée · 26 septembre 2026','Session held · 26 September 2026');
  agir.hero.lead = p('Une formation autour de l’intelligence artificielle pour 20 femmes agripreneuses en Côte d’Ivoire, à l’initiative de la Fondation AWI, avec l’accompagnement pédagogique d’AgroPulse.','A training session focused on artificial intelligence for 20 women agripreneurs in Côte d’Ivoire, initiated by Fondation AWI with educational support from AgroPulse.');
  agir.hero.ctas = [{label:l('Découvrir la formation','Explore the training'),to:'#sec-crowd'},{label:l('Nous contacter','Contact us'),to:'#sec-notif'}];
  Object.assign(a.crowd,{
    kicker:l('26 septembre 2026 · Côte d’Ivoire','26 September 2026 · Côte d’Ivoire'),
    title:l('20 femmes agripreneuses formées','20 women agripreneurs trained'),
    count:20,
    lead:p('La session AGIR-IA du 26 septembre 2026 a réuni 20 femmes agripreneuses en Côte d’Ivoire. Cette action met les femmes agripreneuses au centre de l’accompagnement.','The AGIR-IA session on 26 September 2026 brought together 20 women agripreneurs in Côte d’Ivoire. This activity places women agripreneurs at the centre of the support provided.'),
    caption:l('Chaque silhouette représente une participante à cette session.','Each silhouette represents one participant in this session.'),
  });
  Object.assign(a.apprend,{
    kicker:l('Le programme','The programme'),title:l('Les femmes agripreneuses au cœur d’AGIR-IA','Women agripreneurs at the heart of AGIR-IA'),
    lead:p('AGIR-IA est distinct du programme YIDA-Cashew. Il s’inscrit dans l’activité de formation et de certification d’AgroPulse. Les visuels ci-dessous sont des illustrations, pas des photographies de la session.','AGIR-IA is distinct from YIDA-Cashew. It is part of AgroPulse’s training and certification area. The images below are illustrations, not photographs of the session.'),
    groups:[
      {...card('Un public identifié','A defined audience','20 femmes agripreneuses en Côte d’Ivoire ont participé à la formation du 26 septembre 2026. Cet effectif concerne la session réalisée, pas des places actuellement ouvertes.','20 women agripreneurs in Côte d’Ivoire participated in the training on 26 September 2026. This figure refers to the completed session, not to places currently available.'),image:a.apprend.groups[0].image},
      {...card('Une initiative de la Fondation AWI','An initiative of Fondation AWI','La Fondation AWI est à l’initiative d’AGIR-IA et constitue le partenaire confirmé de cette action.','Fondation AWI initiated AGIR-IA and is the confirmed partner for this activity.'),image:a.apprend.groups[1].image},
      {...card('L’accompagnement d’AgroPulse','Support from AgroPulse','AgroPulse assure la conception, l’animation de la formation et le suivi pédagogique.','AgroPulse handles training design, facilitation and educational follow-up.'),image:a.apprend.groups[2].image},
    ],
  });
  const practical = {
    id:'reperes',type:'programmefaq',title:l('Pour aller plus loin','Find out more'),
    lead:[],groups:[
      card('S’agit-il d’une prochaine formation ?','Is this an upcoming training session?','Non. Cette page présente la session réalisée le 26 septembre 2026. Aucune date ni inscription pour une nouvelle session n’est annoncée ici.','No. This page presents the session held on 26 September 2026. No new session date or registration is announced here.'),
      card('Comment obtenir plus d’informations ?','How can I get more information?','Utilisez le formulaire ci-dessous pour contacter AgroPulse au sujet d’AGIR-IA. Il s’agit d’une demande de renseignements, pas d’une inscription à une formation.','Use the form below to contact AgroPulse about AGIR-IA. This is an information request, not a training registration.'),
    ],ctas:[],meta:[],
  };
  a.notif.lead = p('Pour en savoir plus sur AGIR-IA ou échanger avec AgroPulse, laissez votre adresse e-mail. Aucune nouvelle session n’est ouverte à l’inscription sur cette page.','To find out more about AGIR-IA or speak with AgroPulse, leave your email address. Registration for a new session is not open on this page.');
  agir.sections = [a.crowd,a.apprend,practical,a.notif];
}
