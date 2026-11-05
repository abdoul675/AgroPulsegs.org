// Illustrative images supplied by the project owner in the Stitch collection.
// These scenes do not document actual staff, offices, partners or programme results.
export const visualAssets = {
  1:'agriculture-connectee',2:'talents-terrain',3:'agriculteur-donnees',4:'agripreneuse-tablette',5:'tracteur-champ',6:'agroforesterie',7:'equipe-innovation',8:'capteurs-agricoles',10:'atelier-strategie',11:'vision-agriculture',12:'conseil-terrain',13:'talents-agritech',14:'financement-entreprises',15:'systemes-information',16:'formation-numerique',17:'analyse-ia',18:'climat-durable',19:'incubation-agritech',20:'experts-numeriques',21:'etudes-faisabilite',22:'mecanisation',23:'accompagnement-personnalise',24:'formation-collective',25:'mise-en-oeuvre-terrain',26:'collecte-donnees',27:'innovation-appliquee',28:'restitution-etudes',29:'pilotage-strategique',30:'fellowship-formation',31:'mentorat-terrain',32:'filiere-cajou',33:'travail-collectif',34:'donnees-cajou',35:'suivi-evaluation',36:'femmes-agripreneuses',37:'formation-femmes',38:'agriculture-intelligente',39:'atelier-femmes',40:'ia-au-champ',41:'cooperation-femmes',42:'conseil-personnalise',43:'concertation-partenaires',45:'partenariat-terrain',46:'collaboration',47:'atelier-partenaires',48:'ressources-agricoles',49:'expertise-agronomique',50:'tableaux-bord',51:'publications',52:'presentation-donnees',53:'donnees-ouvertes',54:'accueil-contact',55:'consultation',57:'communication-terrain',58:'support-equipe',
};
export const visualPath = id => {
  if(!visualAssets[id])throw new Error('Unknown supplied image: '+id);
  return 'assets/stitch/'+visualAssets[id]+'.webp';
};
const primary=[16,15,17,18,19,21,20,22];
const services=[[30,24],[50,52],[40,53],[6,11],[27,14],[55,28],[49,58],[5,45]];
const audiences=[[2,3,41,29],[33,34,43,14],[41,43,35,29],[33,32,14,52],[13,41,14,19],[43,33,25,14],[33,43,34,25],[3,41,43,14]];
const section=(page,id)=>page?.sections?.find(item=>item.id===id);
function groupImages(page,id,ids){
  const target=section(page,id);if(!target)return;
  target.groups.forEach((item,index)=>{if(ids[index])item.image=visualPath(ids[index]);});
}
export function applyVisualAssets(pages){
  for(let index=0;index<8;index++){
    const page=pages['pole-'+(index+1)];page.hero.image=visualPath(primary[index]);
    groupImages(page,'faire',services[index]);groupImages(page,'pour',audiences[index]);
  }
  for(const slug of ['accueil','expertises'])groupImages(pages[slug],'poles',primary);
  const heroes={'expertises':13,'a-propos':7,'fellowship':30,'agir-ia':36,'partenaires':43,'ressources':51,'contact':54};
  for(const[slug,id]of Object.entries(heroes))pages[slug].hero.image=visualPath(id);
  section(pages['a-propos'],'identite').image=visualPath(10);
  section(pages['a-propos'],'equipe').image=visualPath(2);
  // Keep the confirmed staff names next to a generic field scene, without fictional portraits.
  for(const item of section(pages['a-propos'],'equipe').groups)delete item.image;
  const yida=pages.fellowship;
  groupImages(yida,'genese',[13,7]);groupImages(yida,'construction',[29,26,43]);
  groupImages(yida,'objectifs',[16,34,20]);groupImages(yida,'publics',[30,32]);
  groupImages(yida,'parcours',[33,31,35]);groupImages(yida,'appris',[24,13,35,26]);
  section(yida,'anacarde').image=visualPath(32);
  groupImages(pages['agir-ia'],'apprend',[39,37,41]);
  groupImages(pages.partenaires,'qui',[47,45,43,46]);
}
// The original maquette uses these fallback images in its HTML, scenes and lab.
// Override their older replacements with the supplied themed images.
export const visualFallbacks=Object.fromEntries(Object.entries({
  '09ae7d312fad348de3a6.webp':8,'8151fb887f84b8198878.webp':32,'6a106959e853926bbff9.webp':2,
  '60540953ca60fd272ab6.webp':16,'5e318a446b0b773d56ab.webp':26,'c550a56bef40ee8f7d4a.webp':17,
  '5bfbd22930dd78fa77a8.webp':18,'5f63c1180c1b9ae1897e.webp':19,'84ce5523408c130a6b7a.webp':22,
  '2e262f0ecac67d8b13ad.webp':36,'d676f93e2530c30efc37.webp':25,'e307ce8d98bf85b18fb7.webp':1,
  '889bc67b5de174597d80.webp':30,
}).map(([name,id])=>['assets/maquette/'+name,visualPath(id)]));
