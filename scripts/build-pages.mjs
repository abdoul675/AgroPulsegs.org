import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { aboutContent } from './about-content.mjs';
const selectedPage = process.argv.find(arg => arg.startsWith('--page='))?.slice(7);
const root = new URL('../public/', import.meta.url);
const source = await readFile(new URL('index.html', root), 'utf8');
const app = await readFile(new URL('app.js', root), 'utf8');
const { copy, services } = vm.runInNewContext(`${app.slice(0, app.indexOf('let language ='))}\n({copy,services})`);
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const tr = (tag, fr, en, cls='') => `<${tag} class="${cls}" data-fr="${esc(fr)}" data-en="${esc(en)}">${esc(fr)}</${tag}>`;
const link = (href, fr, en, cls='button') => `<a href="${href}" class="${cls}" data-fr="${esc(fr)}" data-en="${esc(en)}">${esc(fr)}</a>`;
const photo = (name, fr, en, eager=false) => `<figure class="editorial-photo"><img src="assets/${name}.webp" alt="${esc(fr)}" data-alt-fr="${esc(fr)}" data-alt-en="${esc(en)}" width="1536" height="1024" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"><figcaption data-fr="Visuel illustratif · créé par IA" data-en="Illustrative visual · AI generated">Visuel illustratif · créé par IA</figcaption></figure>`;
const media = {
 terrain: () => photo('agriculture-cooperative-cacao','Deux professionnels examinent une cabosse de cacao.','Two professionals examine a cocoa pod.',true),
 talents: () => photo('jeunes-formation-agritech','De jeunes professionnels travaillent ensemble sur ordinateur en formation.','Young professionals collaborate on laptops during training.',true),
 femmes: () => photo('femme-agripreneure-numerique','Deux agripreneures échangent autour d’un smartphone dans un atelier agricole.','Two women agripreneurs discuss a smartphone in an agricultural workshop.',true),
 donnees: () => photo('data-agricole-tablette','Un technicien consulte une carte parcellaire sur une tablette au champ.','A field technician views a parcel map on a tablet.',true),
 climat: () => photo('climat-parcelles-senegal','Vue aérienne de parcelles maraîchères autour d’un cours d’eau.','Aerial view of vegetable plots around a river.',true),
 incubation: () => photo('incubation-capteur-agricole','Deux jeunes entrepreneurs testent un capteur d’irrigation en atelier.','Two young founders test an irrigation sensor in a workshop.',true),
 collaboration: () => photo('partenariat-equipe-agricole','Des professionnels échangent autour d’une carte dans une coopérative.','Professionals discuss a map at a cooperative.',true),
 mecanisation: () => photo('conseil-mecanisation-motoculteur','Un opérateur et une responsable de coopérative examinent un motoculteur.','An operator and a cooperative manager inspect a walking tractor.',true),
 formation: () => photo('formation-agents-cooperative','Une formatrice explique des fiches d’enquête à de jeunes agents de coopérative.','An instructor explains survey sheets to young cooperative agents.',true),
};
function diagram(type) {
 const maps = {
  donnees: [['Collecter','Collect'],['Structurer','Structure'],['Partager','Share']],
  analytics: [['Observer','Observe'],['Analyser','Analyse'],['Décider','Decide']],
  climat: [['Mesurer','Measure'],['Anticiper','Anticipate'],['Adapter','Adapt']],
  incubation: [['Une idée','An idea'],['Un modèle','A model'],['Un projet','A venture']],
 };
 return `<div class="diagram diagram-${type}"><span class="diagram-kicker">AGROPULSE / ${type.toUpperCase()}</span><svg viewBox="0 0 600 300" aria-hidden="true"><defs><pattern id="grid-${type}" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="currentColor" stroke-opacity=".12"/></pattern></defs><rect width="600" height="300" fill="url(#grid-${type})"/><circle cx="300" cy="150" r="116" fill="none" stroke="currentColor" stroke-opacity=".3"/><ellipse cx="300" cy="150" rx="185" ry="70" fill="none" stroke="currentColor" stroke-opacity=".5" transform="rotate(-20 300 150)"/><path d="M60 220 160 170 250 185 330 100 430 130 540 65" fill="none" stroke="#7bd175" stroke-width="4"/><g fill="#1AA3C4"><circle cx="160" cy="170" r="9"/><circle cx="330" cy="100" r="12"/><circle cx="430" cy="130" r="8"/></g><circle cx="300" cy="150" r="43" fill="#3F9A3C"/><path d="m278 151 15 15 30-33" fill="none" stroke="white" stroke-width="5"/></svg><div class="diagram-flow">${maps[type].map(([fr,en])=>tr('span',fr,en)).join('<span aria-hidden="true">↗</span>')}</div>${tr('small','Schéma de démarche · aucune donnée de résultat','Approach diagram · no outcome data')}</div>`;
}
const slugs=['formation-talents','systemes-donnees','ia-analytics','climat-economie-verte','incubation-agritech','conseil-mecanisation'];
const themes=['formation','donnees','analytics','climat','incubation','mecanisation'];
const headings=[['Faire grandir les talents.','Grow local talent.'],['Des données qui circulent.','Data that connects.'],['Voir plus clair. Décider mieux.','Clearer insights. Better decisions.'],['Cultiver la résilience.','Grow resilience.'],['De l’idée au terrain.','From idea to field.'],['Le terrain guide la stratégie.','Let the field guide strategy.']];
const pillars=[
 [['Former','Train','Data, IA et statistiques.','Data, AI and statistics.'],['Certifier','Certify','Valoriser les compétences.','Recognise skills.'],['Accompagner','Support','Renforcer les équipes agricoles.','Strengthen agricultural teams.']],
 [['Cartographier','Map','Comprendre vos données et vos usages.','Understand your data and uses.'],['Moderniser','Modernise','Applications, portails et plateformes.','Applications, portals and platforms.'],['Gouverner','Govern','Des protocoles de partage clairs.','Clear sharing protocols.']],
 [['Prévoir','Forecast','Prix et rendements agricoles.','Agricultural prices and yields.'],['Visualiser','Visualise','Des tableaux de bord utiles.','Useful dashboards.'],['Innover','Innovate','DataLab et publications sectorielles.','DataLab and sector publications.']],
 [['Mesurer','Measure','MRV, carbone et conformité ESG.','MRV, carbon and ESG compliance.'],['Anticiper','Anticipate','Alertes et cartographie des risques.','Alerts and risk mapping.'],['Financer','Finance','Préparer les dossiers de fonds verts.','Prepare green fund applications.']],
 [['Structurer','Structure','Clarifier le modèle d’affaires.','Clarify the business model.'],['Accélérer','Accelerate','Incubation et mentorat.','Incubation and mentoring.'],['Connecter','Connect','Rencontrer les investisseurs.','Connect with investors.']],
 [['Comprendre','Understand','Diagnostics et études de faisabilité.','Diagnostics and feasibility studies.'],['Orienter','Guide','Stratégies et études de marché.','Strategies and market studies.'],['Déployer','Deliver','Mécanisation, maintenance et formation.','Mechanisation, maintenance and training.']]
];
const cards = items => `<div class="steps">${items.map((p,i)=>`<article><span aria-hidden="true">0${i+1}</span>${tr('h3',p[0],p[1])}${tr('p',p[2],p[3])}</article>`).join('')}</div>`;
const contact = source.match(/<section class="contact section"[\s\S]*?<\/section>/)[0];
let header=source.slice(source.indexOf('<body>')+6,source.indexOf('<main'));
header=header.replaceAll('href="#accueil"','href="index.html"').replaceAll('href="#apropos"','href="apropos.html"').replaceAll('href="#expertises"','href="expertises.html"').replaceAll('href="#programmes"','href="programmes.html"').replaceAll('href="#contact"','href="contact.html"');
const footer=source.slice(source.indexOf('  <footer')).replaceAll('href="#accueil"','href="index.html"');
const head=source.slice(0,source.indexOf('<body>'));
const breadcrumb = () => `<div class="breadcrumb">${link('index.html','Accueil','Home','')}<span aria-hidden="true">/</span>${tr('span','Explorer AgroPulse','Explore AgroPulse')}</div>`;
async function page(file,fr,en,body,kind='split') {
 if(selectedPage && file!==selectedPage)return;
 // Keep the home hero, image frame and programme cards across all internal pages.
 if(file!=='apropos'){
  const heroVisual = file==='expertises' ? media.donnees() : file==='programmes' ? media.incubation() : media.collaboration();
  body=body.replace(/<section class="section (?:expertise-intro|contact-heading)">([\s\S]*?)<\/section>/,(_,content)=>`<section class="hero section"><div class="hero-copy">${content}<div class="hero-foot"><span class="tiny-icon" aria-hidden="true">◎</span>${tr('span','Côte d’Ivoire · Sénégal · Guinée-Bissau','Côte d’Ivoire · Senegal · Guinea-Bissau')}</div></div>${heroVisual}</section>`);
  body=body.replace('class="section scope-section"','class="approach section scope-section"');
  body=body.replace('class="section expertise-directory"','class="expertises section expertise-directory"');
  if(file==='fellowship' || file==='agir-ia'){
   const sectionClass=file==='fellowship'?'related':'programme-note';
   const supportPhoto=file==='fellowship'?photo('formation-agents-cooperative','Une formatrice accompagne de jeunes agents de coopérative.','An instructor supports young cooperative agents.'):photo('data-agricole-tablette','Un technicien consulte une carte sur une tablette au champ.','A technician views a map on a tablet in the field.');
   body=body.replace(new RegExp(`<section class="section ${sectionClass}">([\\s\\S]*?)</section>`),(_,content)=>`<section class="about section programme-photo"><div>${content}</div>${supportPhoto}</section>`);
  }
  if(file==='programmes'){
   body=body.replace('class="section programme-directory"','class="programmes section"><div class="program-grid programme-cards"').replace('</article></section>','</article></div></section>');
   let cardIndex=0;
   body=body.replace(/<article>/g,()=>`<article class="${cardIndex++===0?'fellowship':'agir'}">`);
  }
 }
 if(file==='programmes')body=body.replace(media.femmes(),media.femmes().replace('fetchpriority="high"','loading="lazy"'));
 // Reuse the original home hero and its media frame on every detail page.
 body=body.replace(/class="section page-hero[^\"]*"/g,'class="hero section"').replaceAll('class="page-copy"','class="hero-copy"');
 if(body.includes('class="hero section"'))body=body.replace('class="editorial-photo"','class="editorial-photo hero-art"');
 if(file!=='apropos'){
  body=body.replace(/(<figure class="editorial-photo hero-art">[\s\S]*?)<figcaption[\s\S]*?<\/figcaption>/,`$1<div class="art-label"><span class="dot"></span>${tr('span','LA TERRE RENCONTRE LA DONNÉE','WHERE LAND MEETS DATA')}</div><div class="art-caption">${tr('span','AGROPULSE · VISUEL ILLUSTRATIF IA','AGROPULSE · AI ILLUSTRATIVE VISUAL')}${tr('p','Un regard local. De nouvelles perspectives.','Local insight. New perspectives.')}<span aria-hidden="true">↗</span></div>`);
  body=body.replace(/(<h1[^>]*data-fr="[^"]*" data-en="[^"]*">)([^<]+)(<\/h1>)/,(_,open,text,close)=>{
   const fr=text.split('. ').filter(Boolean);
   if(fr.length<2)return open+text+close;
   const en=(open.match(/data-en="([^"]*)"/)?.[1]||'').split('. ').filter(Boolean);
   return `<h1>${tr('span',fr[0]+'.',en[0]+'.')}<br>${tr('em',fr.slice(1).join('. '),en.slice(1).join('. '))}</h1>`;
  });
 }
 const currentHeader=header.replace(`href="${file}.html"`,`aria-current="page" href="${file}.html"`);
 const descriptionFr=`${fr} : découvrez l’accompagnement AgroPulse pour les filières agricoles en Afrique de l’Ouest.`;
 const descriptionEn=`${en}: explore AgroPulse support for agricultural value chains in West Africa.`;
 let pageHead=head.replace(/<title>.*?<\/title>/,`<title>${esc(fr)} — AgroPulse</title>`).replace(/(<meta name="description" content=")[^"]+/,`$1${esc(descriptionFr)}`);
 if(file==='apropos')pageHead=pageHead.replace('</head>','  <link rel="stylesheet" href="apropos.css">\n</head>');
 await writeFile(new URL(`${file}.html`,root),pageHead+`<body class="internal" data-title-fr="${esc(fr)} — AgroPulse" data-title-en="${esc(en)} — AgroPulse" data-description-fr="${esc(descriptionFr)}" data-description-en="${esc(descriptionEn)}">${currentHeader}<main id="main">${breadcrumb()}${body}</main>${footer}`);
}
for(let i=0;i<6;i++) {
 const theme=themes[i];
 const visual=media[theme]?media[theme]():media.incubation();
 const fieldPhotos=['agriculture-cooperative-cacao','formation-agents-cooperative','data-agricole-tablette','agriculture-cooperative-cacao','partenariat-equipe-agricole','formation-agents-cooperative'];
 const fieldAlts=[['Échange autour d’une cabosse de cacao sur le terrain.','Discussion around a cocoa pod in the field.'],['Formation aux enquêtes agricoles en coopérative.','Agricultural survey training at a cooperative.'],['Consultation d’une carte parcellaire sur tablette.','Viewing a parcel map on a tablet.'],['Observation de la culture du cacao sur le terrain.','Observing cocoa cultivation in the field.'],['Collaboration autour d’une carte agricole.','Collaboration around an agricultural map.'],['Transmission de méthodes auprès d’agents de coopérative.','Sharing methods with cooperative agents.']];
 const fieldPhoto=photo(fieldPhotos[i],...fieldAlts[i]);
 const details=`<section class="section scope-section">${tr('p','NOTRE CHAMP D’ACTION','OUR SCOPE','eyebrow')}${tr('h2','Une expertise, des réponses concrètes.','Expertise with practical answers.')}${cards(pillars[i])}<div class="scope-photo-strip">${fieldPhoto}</div><details class="business-details">${tr('summary','Consulter le périmètre complet','Explore the full scope')}${tr('p',services.fr[i][2],services.en[i][2])}</details></section>`;
 await page(slugs[i],services.fr[i][0],services.en[i][0],`<section class="section page-hero theme-${theme}"><div class="page-copy">${tr('p',services.fr[i][0],services.en[i][0],'eyebrow')}${tr('h1',...headings[i])}${tr('p',services.fr[i][1],services.en[i][1],'intro')}${link('#contact','Construisons votre projet ↗','Let’s build your project ↗')}</div>${visual}</section>${details}${i===0?`<section class="section related">${tr('h2','Un parcours pour la relève.','A pathway for the next generation.')}${link('fellowship.html','Explorer le Fellowship ↗','Explore the Fellowship ↗')}</section>`:''}${contact}`,['split','reverse','dark','panorama','poster','split'][i]);
}
await page('fellowship','Fellowship Programme','Fellowship Programme',`<section class="section page-hero theme-talents"><div class="page-copy">${tr('p','FELLOWSHIP PROGRAMME','FELLOWSHIP PROGRAMME','eyebrow')}${tr('h1','Les talents d’aujourd’hui. L’agriculture de demain.','Today’s talent. Tomorrow’s agriculture.')}${tr('p','Data. IA. Statistiques. Un parcours pour les jeunes, avec une priorité à la filière anacarde.','Data. AI. Statistics. A pathway for young people, with an initial focus on cashew.','intro')}${link('#parcours','Explorer le parcours ↓','Explore the pathway ↓')}</div>${media.talents()}</section><section class="section journey" id="parcours"><div class="key-number"><strong>2–3</strong>${tr('span','mois de formation prévus','months of planned training')}</div><div>${tr('p','APPRENDRE · PRATIQUER · S’ENGAGER','LEARN · PRACTISE · COMMIT','eyebrow')}${tr('h2','Trois étapes. Un nouvel horizon.','Three steps. A new horizon.')}${cards([['Se former','Train','Donnée, IA et statistiques agricoles.','Agricultural data, AI and statistics.'],['Se certifier','Get certified','Valoriser les compétences acquises.','Recognise the skills acquired.'],['Prendre son élan','Move forward','Un accompagnement vers le placement professionnel.','Support towards professional placement.']])}</div></section><section class="section programme-note">${tr('h2','Le prochain départ se prépare.','The next chapter is taking shape.')}${tr('p','Calendrier, critères et ouverture des candidatures à confirmer. Aucune candidature n’est collectée.','Schedule, criteria and application opening to be confirmed. No applications are collected.')}${link('#contact','S’informer sur le programme ↗','Enquire about the programme ↗')}</section>${contact}`,'reverse');
await page('agir-ia','AGIR-IA','AGIR-IA',`<section class="section page-hero theme-femmes"><div class="page-copy">${tr('p','AGIR-IA · AVEC LA FONDATION AWI','AGIR-IA · WITH THE AWI FOUNDATION','eyebrow')}${tr('h1','L’intelligence artificielle au féminin.','AI for women agripreneurs.')}${tr('p','Des outils numériques au service de l’entrepreneuriat agricole en Côte d’Ivoire.','Digital tools for agricultural entrepreneurship in Côte d’Ivoire.','intro')}${link('#projet','Découvrir le projet ↓','Explore the project ↓')}</div>${media.femmes()}</section><section class="section project-facts" id="projet"><div class="key-number"><strong>20</strong>${tr('span','femmes agripreneures concernées selon le contenu fourni','women agripreneurs according to the supplied content')}</div><div>${tr('p','FORMATION DU 26 SEPTEMBRE 2026','TRAINING ON 26 SEPTEMBER 2026','eyebrow')}${tr('h2','Apprendre pour entreprendre.','Learn to build a business.')}${cards([['Fondation AWI','AWI Foundation','African Women Innovation 3.0, initiatrice du programme.','African Women Innovation 3.0, programme initiator.'],['AgroPulse','AgroPulse','Conception et animation de la formation.','Training design and delivery.'],['Suivi pédagogique','Educational follow-up','Un accompagnement assuré par AgroPulse.','Support provided by AgroPulse.']])}</div></section><section class="section programme-note">${tr('p','Projet distinct du Fellowship. Les informations fournies restent soumises à la validation de Mme Hélène Nichy.','Separate from the Fellowship. Supplied information remains subject to validation by Ms Hélène Nichy.')}${link('fellowship.html','Découvrir aussi le Fellowship ↗','Also explore the Fellowship ↗','text-link')}</section>${contact}`,'panorama');
await page('apropos','À propos','About us',aboutContent({tr,link,photo}),'split');
await page('expertises','Nos expertises','Our expertise',`<section class="section expertise-intro">${tr('p','NOS EXPERTISES','OUR EXPERTISE','eyebrow')}${tr('h1','Six leviers. Une transformation.','Six levers. One transformation.')}${tr('p',copy.fr.expertiseIntro,copy.en.expertiseIntro,'intro')}</section><section class="section expertise-directory"><div class="services" id="services"></div></section>${contact}`,'directory');
await page('programmes','Nos programmes','Our programmes',`<section class="section expertise-intro">${tr('p','JEUNESSE · FEMMES · INNOVATION','YOUTH · WOMEN · INNOVATION','eyebrow')}${tr('h1','Faire grandir les possibles.','Grow new possibilities.')}</section><section class="section programme-directory"><article>${media.talents()}<div>${tr('p','FELLOWSHIP PROGRAMME','FELLOWSHIP PROGRAMME','eyebrow')}${tr('h2','La relève prend son élan.','The next generation steps forward.')}${tr('p','Formation, certification et accompagnement vers l’emploi.','Training, certification and support towards employment.')}${link('fellowship.html','Explorer le parcours ↗','Explore the pathway ↗')}</div></article><article>${media.femmes()}<div>${tr('p','AGIR-IA · FONDATION AWI','AGIR-IA · AWI FOUNDATION','eyebrow')}${tr('h2','Le numérique au féminin.','Digital skills for women.')}${tr('p','Une formation destinée aux agripreneures de Côte d’Ivoire.','Training for women agripreneurs in Côte d’Ivoire.')}${link('agir-ia.html','Découvrir le projet ↗','Explore the project ↗')}</div></article></section>${contact}`,'directory');
await page('contact','Parlons de votre projet','Let’s discuss your project',`<section class="section contact-heading">${tr('p','DE L’ÉCOUTE À L’ACTION','FROM LISTENING TO ACTION','eyebrow')}${tr('h1','Tout commence par un échange.','It starts with a conversation.')}</section>${contact}`,'contact');
// Keep the existing public concept URL functional, with the shared navigation and bilingual content.
if(!selectedPage || selectedPage==='fellowship')await writeFile(new URL('fellowship-concept.html',root),await readFile(new URL('fellowship.html',root),'utf8'));
console.log(selectedPage ? `Built bilingual page: ${selectedPage}.` : 'Built 13 bilingual internal pages.');
