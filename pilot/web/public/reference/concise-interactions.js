// Minimal navigation for the owner-approved concise pages. Text is rendered on the server.
(()=>{
 const config=JSON.parse(document.querySelector('#page-state').textContent);
 const nav=document.querySelector('#nav'),button=document.querySelector('#bg');
 button.onclick=()=>{const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));};
 nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');button.setAttribute('aria-expanded','false');}});
 document.querySelector('#lang').onclick=()=>location.assign('/'+(config.locale==='fr'?'en':'fr')+'/'+config.slug+location.hash);
 document.documentElement.dataset.interiorReady=config.slug;
})();
