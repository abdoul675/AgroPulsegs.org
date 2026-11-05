// Shared by Strapi, the published-content adapter and the browser preview.
const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
const properties=new Set(['color','background-color','border','border-color','border-width','border-style','border-radius','box-shadow','padding','padding-top','padding-right','padding-bottom','padding-left','margin','margin-top','margin-right','margin-bottom','margin-left','gap','row-gap','column-gap','font-family','font-size','font-weight','line-height','letter-spacing','text-align','text-transform','text-decoration','max-width','min-width','width','height','min-height','max-height','object-fit','display','align-items','justify-content','grid-template-columns']);
const functions=new Set(['rgb','rgba','hsl','hsla','minmax','repeat','min','max','clamp','calc']);
const selector=/^(?:#sec-[a-z][a-z0-9-]{0,79}\s+)?\.(?:agp-card-grid|agp-card|agp-section|agp-page-title|agp-section-title|agp-intro)(?:\s+(?:h2|h3|p|img|a))?$/u;
const fail=message=>{throw new Error(message);};
function cssRules(input,depth=0){
 let output='',rest=input.trim();
 while(rest){
  if(rest.startsWith('@media')){
   if(depth)fail('Une seule profondeur de règle @media est autorisée.');
   const match=rest.match(/^@media\s*\(\s*(min|max)-width\s*:\s*(\d{3,4})px\s*\)\s*\{/u);
   if(!match||Number(match[2])<320||Number(match[2])>1920)fail('Utilisez @media (max-width: 768px), entre 320 et 1920 px.');
   let balance=1,end=match[0].length;
   for(;end<rest.length&&balance;end++){if(rest[end]==='{')balance++;if(rest[end]==='}')balance--;}
   if(balance)fail('Une accolade CSS est manquante.');
   output+='@media ('+match[1]+'-width: '+match[2]+'px){'+cssRules(rest.slice(match[0].length,end-1),1)+'}';rest=rest.slice(end).trim();continue;
  }
  const open=rest.indexOf('{'),close=rest.indexOf('}');
  if(open<1||close<open||rest.slice(open+1,close).includes('{'))fail('Écrivez des règles CSS complètes : sélecteur { propriété: valeur; }.');
  const selectors=rest.slice(0,open).split(',').map(value=>value.trim());
  if(selectors.some(value=>!selector.test(value)))fail('Sélecteur autorisé : .agp-card, .agp-card-grid, .agp-section, .agp-page-title, .agp-section-title ou .agp-intro.');
  const declarations=[];
  for(const declaration of rest.slice(open+1,close).split(';').map(value=>value.trim()).filter(Boolean)){
   const index=declaration.indexOf(':'),property=declaration.slice(0,index).trim().toLowerCase(),value=declaration.slice(index+1).trim();
   if(index<1||!properties.has(property))fail('Propriété CSS non autorisée : '+property.slice(0,50)+'.');
   if(!value||value.length>240||!/^[a-zA-Z0-9#.,%()\s+*-]+$/u.test(value))fail('Valeur CSS non autorisée. Les liens, le HTML et !important sont exclus.');
   let balance=0;for(const char of value){if(char==='(')balance++;if(char===')'&&--balance<0)fail('Parenthèses CSS incorrectes.');}if(balance)fail('Parenthèses CSS incorrectes.');
   for(const match of value.matchAll(/([a-zA-Z-]+)\s*\(/gu))if(!functions.has(match[1].toLowerCase()))fail('Fonction CSS non autorisée.');
   declarations.push(property+':'+value);
  }
  if(declarations.length)output+=selectors.map(value=>'#app '+value).join(',')+'{'+declarations.join(';')+'}';
  rest=rest.slice(close+1).trim();
 }
 return output;
}
export function compileCustomCss(value=''){
 if(typeof value!=='string'||value.length>10000||/[\\<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value))fail('CSS trop long ou caractères non autorisés.');
 const clean=value.replace(/\/\*[\s\S]*?\*\//gu,'').trim();
 if(clean.includes('/*')||clean.includes('*/'))fail('Un commentaire CSS est incomplet.');
 return cssRules(clean);
}
export function normalizeStyles(input={}){
 if(!record(input))fail('Les réglages d’apparence doivent être un objet.');
 const keys=['cardRadius','cardGap','headingColor','cardBackground','cardBorderColor','cardShadow','customCss'];
 if(Object.keys(input).some(key=>!keys.includes(key)))fail('Réglage d’apparence non autorisé.');
 const result={};
 for(const[key,max]of[['cardRadius',40],['cardGap',48]])if(input[key]!==undefined&&input[key]!==''){
  if(!Number.isInteger(input[key])||input[key]<0||input[key]>max)fail('Valeur d’espacement ou d’arrondi non autorisée.');result[key]=input[key];
 }
 for(const key of ['headingColor','cardBackground','cardBorderColor'])if(input[key]!==undefined&&input[key]!==''){
  if(typeof input[key]!=='string'||!/^#[a-fA-F0-9]{6}$/u.test(input[key]))fail('Choisissez une couleur hexadécimale à six chiffres.');result[key]=input[key].toLowerCase();
 }
 if(input.cardShadow!==undefined&&input.cardShadow!==''){
  if(!['none','soft','strong'].includes(input.cardShadow))fail('Ombre non autorisée.');result.cardShadow=input.cardShadow;
 }
 if(input.customCss!==undefined&&input.customCss!==''){
  compileCustomCss(input.customCss);result.customCss=input.customCss;
 }
 return result;
}
export function compileStyles(input={}){
 const value=normalizeStyles(input),cards=[];let css='';
 if(value.cardRadius!==undefined)cards.push('border-radius:'+value.cardRadius+'px');
 if(value.cardBackground)cards.push('background-color:'+value.cardBackground);
 if(value.cardBorderColor)cards.push('border:1px solid '+value.cardBorderColor);
 if(value.cardShadow)cards.push('box-shadow:'+({none:'none',soft:'0 4px 16px rgba(15,47,35,0.12)',strong:'0 10px 28px rgba(15,47,35,0.22)'})[value.cardShadow]);
 if(cards.length)css+='#app .agp-card{'+cards.join(';')+'}';
 if(value.cardGap!==undefined)css+='#app .agp-card-grid{gap:'+value.cardGap+'px}';
 if(value.headingColor)css+='#app .agp-section-title,#app .agp-card h3{color:'+value.headingColor+'}';
 return css+compileCustomCss(value.customCss||'');
}
