// Editorial revision requested by the project owner: direct information, no hidden tabs.
const L=(fr,en)=>({fr,en});
const section=(id,type,title,lead=[],groups=[])=>({id,type,title,kicker:L('',''),lead,groups,ctas:[],quote:L('',''),meta:[]});
export function simplifyContent(pages){
 const summaries=[
  L('Former les talents et renforcer les compétences des équipes agricoles.','Train talent and strengthen agricultural teams’ skills.'),
  L('Organiser les données et moderniser les systèmes d’information agricoles.','Organise data and modernise agricultural information systems.'),
  L('Analyser les données pour éclairer les décisions agricoles.','Analyse data to support agricultural decisions.'),
  L('Accompagner les projets de résilience et de transition verte.','Support resilience and green transition projects.'),
  L('Accompagner les porteurs de projets et les startups agri-tech.','Support project founders and agri-tech startups.'),
  L('Évaluer les projets et choisir des solutions adaptées au terrain.','Assess projects and choose solutions suited to field conditions.')
 ];
 const services=[
  [L('Formation','Training'),L('Parcours Fellowship et renforcement des compétences en données et numérique.','Fellowship pathways and capacity building in data and digital skills.'),L('Insertion professionnelle','Professional integration'),L('Accompagnement des talents et mise en relation avec les employeurs.','Talent support and introductions to employers.'),L('Appui aux équipes','Team support'),L('Mise à disposition de compétences et accompagnement des systèmes d’information.','Access to skilled professionals and information system support.')],
  [L('Diagnostic des données','Data assessment'),L('Identifier les données disponibles, leurs usages et les besoins des équipes.','Identify available data, its uses and team needs.'),L('Outils et plateformes','Tools and platforms'),L('Concevoir ou moderniser les applications et portails de filière.','Design or modernise value-chain applications and portals.'),L('Gouvernance','Governance'),L('Définir les règles de qualité, de partage et de gestion des données.','Define rules for data quality, sharing and management.')],
  [L('Analyse et prévision','Analysis and forecasting'),L('Étudier les prix, les rendements et les évolutions des filières.','Study prices, yields and changes in agricultural value chains.'),L('Tableaux de bord','Dashboards'),L('Présenter les indicateurs utiles au suivi des activités et des projets.','Present indicators useful for monitoring activities and projects.'),L('Aide à la décision','Decision support'),L('Adapter les méthodes d’intelligence artificielle aux données et aux besoins du projet.','Adapt AI methods to project data and needs.')],
  [L('Résilience climatique','Climate resilience'),L('Analyser les risques et préparer les actions d’adaptation.','Analyse risks and prepare adaptation actions.'),L('Traçabilité et suivi','Traceability and monitoring'),L('Structurer les données nécessaires au suivi environnemental des filières.','Structure data needed for environmental monitoring of value chains.'),L('Financement vert','Green finance'),L('Accompagner la préparation des projets et dossiers de financement climatique.','Support the preparation of climate projects and funding applications.')],
  [L('Structuration du projet','Project development'),L('Préciser le besoin, le modèle économique et les premières étapes.','Clarify the need, business model and first steps.'),L('Incubation et mentorat','Incubation and mentoring'),L('Accompagner le développement et l’expérimentation des solutions.','Support solution development and experimentation.'),L('Passage à l’échelle','Scaling up'),L('Préparer le développement de l’activité et la mise en relation avec les investisseurs.','Prepare business growth and introductions to investors.')],
  [L('Études et diagnostics','Studies and assessments'),L('Évaluer la faisabilité, les besoins et les conditions de mise en œuvre des projets.','Assess project feasibility, needs and implementation conditions.'),L('Conseil stratégique','Strategic consulting'),L('Appuyer les stratégies de filière et l’évaluation des programmes.','Support value-chain strategies and programme evaluation.'),L('Mécanisation','Mechanisation'),L('Conseiller le choix, le financement, la maintenance et l’utilisation des équipements.','Advise on equipment selection, financing, maintenance and use.')]
 ];
 const audiences=[
  L('Jeunes talents, coopératives, entreprises et institutions agricoles.','Young talent, cooperatives, agricultural businesses and institutions.'),
  L('Coopératives, agro-industries et organismes de gestion des filières.','Cooperatives, agribusinesses and value-chain management bodies.'),
  L('Entreprises, coopératives et institutions qui souhaitent mieux exploiter leurs données.','Businesses, cooperatives and institutions seeking to make better use of their data.'),
  L('Coopératives, entreprises et organismes porteurs de projets environnementaux.','Cooperatives, businesses and organisations developing environmental projects.'),
  L('Porteurs de projets, startups, chercheurs et partenaires de l’innovation agricole.','Founders, startups, researchers and agricultural innovation partners.'),
  L('Institutions, entreprises, coopératives et partenaires de développement.','Institutions, businesses, cooperatives and development partners.')
 ];
 const contact=()=>{const s=section('contact','cta',L('Parlons de votre projet','Let’s discuss your project'));s.ctas=[{label:L('Nous contacter','Contact us'),to:'contact'}];return s;};
 for(let index=0;index<6;index++){
  const page=pages['pole-'+(index+1)];page.nosub=true;page.noticker=true;
  page.hero.scene='';page.hero.quote=L('','');page.hero.aside=[];page.hero.lead=[summaries[index]];page.hero.ctas=[];
  const groups=[];for(let i=0;i<services[index].length;i+=2)groups.push({title:services[index][i],text:[services[index][i+1]],points:[],bullets:[],meta:[]});
  const offer=section('services','features',L('Nos services','Our services'),[],groups);offer.noimg=true;
  page.sections=[offer,section('public','text',L('Pour qui ?','Who is it for?'),[audiences[index]]),contact()];
 }
 const about=pages['a-propos'];about.nosub=true;about.noticker=true;about.hero.scene='';about.hero.quote=L('','');about.hero.aside=[];
 about.hero.title=L('À propos d’AgroPulse','About AgroPulse');
 about.hero.lead=[L('AgroPulse Global Solutions est une société de conseil et de services numériques pour les filières agricoles en Afrique de l’Ouest.','AgroPulse Global Solutions is a consulting and digital services company for agricultural value chains in West Africa.')];
 const mission=section('mission','text',L('Notre mission','Our mission'),[L('Mettre la donnée, l’intelligence artificielle et l’économie verte au service des acteurs agricoles.','Put data, artificial intelligence and the green economy at the service of agricultural stakeholders.')]);
 const team=section('equipe','text',L('Notre équipe','Our team'),[
  L('Conseil agricole, numérique, climat et formation : des compétences complémentaires au service du terrain.','Agricultural consulting, digital technology, climate and training: complementary skills serving the field.'),
  L('La présentation des membres sera ajoutée après validation des noms et fonctions.','Team profiles will be added once names and roles are approved.')
 ]);
 about.sections=[mission,team];
 const listing=pages.expertises;listing.nosub=true;listing.noticker=true;listing.hero.scene='';listing.hero.quote=L('','');listing.hero.aside=[];
 listing.hero.lead=[L('Six domaines pour accompagner vos projets agricoles.','Six areas of expertise to support your agricultural projects.')];
 listing.sections=[section('domaines','poles',L('Choisissez votre besoin','Find the expertise you need'),[],summaries.map((summary,index)=>({title:pages['pole-'+(index+1)].hero.title,text:[summary],image:pages['pole-'+(index+1)].hero.image,to:'pole-'+(index+1)})))];
 return pages;
}
