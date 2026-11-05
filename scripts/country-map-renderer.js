// Reuse the approved Africa SVG and its projected country points.
const countryMapSelections=new Map();
function countryMapHTML(s){
 const groups=s.groups||[],allowed=new Set(['CI','SN','GW']);
 const countries=groups.filter(g=>allowed.has(g.code));
 const selected=countryMapSelections.get(CUR+':'+s.id)||countries[0]?.code||'CI';
 const points=[...countries].sort((a,b)=>window.MPT[a.code][1]-window.MPT[b.code][1]);
 const markers=points.map((g,index)=>{const[x,y]=window.MPT[g.code],labelY=164+index*64;return `<g data-map-mark="${E(g.code)}"><path class="country-map-leader" d="M210 ${labelY-6} L${x} ${y}"/><path class="country-map-signal" pathLength="1" d="M210 ${labelY-6} L${x} ${y}"/><circle class="country-map-pulse" cx="${x}" cy="${y}" r="18"/><circle class="country-map-dot" cx="${x}" cy="${y}" r="${g.code==='CI'?9:7}"/><text x="16" y="${labelY}">${E(tr(g.title))}</text>${g.code==='CI'?`<text class="country-map-primary-label" x="16" y="${labelY+22}">${EN()?'Main country':'Pays principal'}</text>`:''}</g>`;}).join('');
 let map=window.AFR.replace('class="land"','class="country-map-land"').replace('<g id="mapl"></g>','<g class="country-map-labels">'+markers+'</g>');
 map=map.replace(/aria-label="[^"]*"/,`aria-label="${E(EN()?'Africa: Côte d’Ivoire, main country, Senegal and Guinea-Bissau':'Afrique : Côte d’Ivoire, pays principal, Sénégal et Guinée-Bissau')}"`);
 const bulletLines=g=>(g.text||[]).flatMap(p=>tr(p).split(/\r?\n/u)).map(text=>text.trim().replace(/^[-–•]\s*/u,'')).filter(Boolean);
 const cards=countries.map(g=>`<article class="country-card"${g.code==='CI'?' data-map-primary="true"':''}><button type="button" data-map-country="${E(g.code)}" aria-pressed="${g.code===selected}"><span class="country-name">${E(tr(g.title))}</span>${g.code==='CI'?`<span class="country-primary-badge">${EN()?'Main country':'Pays principal'}</span>`:''}</button><ul class="country-points">${bulletLines(g).map(text=>`<li>${E(text)}</li>`).join('')}</ul></article>`).join('');
 const href=s.compact?'#p-contact':'#sec-form';
 return `<div class="w">${sh(s)}<div class="country-map-container${s.compact?' country-map-compact':''}" data-map-selected="${E(selected)}"><figure class="country-map-figure">${map}<figcaption>${EN()?'Countries of intervention':'Pays d’intervention'} · <span class="country-map-current">${E(tr((countries.find(g=>g.code===selected)||countries[0])?.title))}</span></figcaption></figure><div class="country-map-copy"><div class="country-list">${cards}</div><a class="btn" href="${href}">${EN()?'Contact our team':'Contacter notre équipe'}</a></div></div></div>`;
}
document.addEventListener('click',event=>{
 let button=event.target.closest('button[data-map-country]');
 const shape=event.target.closest('.country-map-land path[data-c],.country-map-labels [data-map-mark]');
 const map=(button||shape)?.closest('.country-map-container');if(!map)return;
 const code=shape?.dataset.c||shape?.dataset.mapMark;
 if(!button&&['CI','SN','GW'].includes(code))button=map.querySelector('button[data-map-country="'+code+'"]');
 if(!button)return;
 map.dataset.mapSelected=button.dataset.mapCountry;
 countryMapSelections.set(CUR+':'+map.closest('section').id.replace('sec-',''),button.dataset.mapCountry);
 const current=map.querySelector('.country-map-current');if(current)current.textContent=button.querySelector('.country-name').textContent;
 map.querySelectorAll('button[data-map-country]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
});
