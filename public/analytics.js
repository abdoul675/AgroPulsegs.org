(() => {
  const allowed = new Set(['qr-access','home','about','expertise','fellowship','agir-ia','partners','resources','contact','legal','privacy', ...Array.from({length:8},(_,i)=>`expertise-${i+1}`)]);
  const fromHash = () => {
    const slug = location.hash.replace(/^#p-/u,'');
    if (!slug || slug === 'accueil') return 'home';
    if (slug === 'a-propos') return 'about';
    if (slug === 'expertises') return 'expertise';
    if (slug === 'fellowship') return 'fellowship';
    if (slug === 'agir-ia') return 'agir-ia';
    if (slug === 'partenaires') return 'partners';
    if (slug === 'ressources') return 'resources';
    if (slug === 'contact') return 'contact';
    if (slug === 'mentions-legales') return 'legal';
    if (slug === 'confidentialite') return 'privacy';
    const pole = /^pole-(\d+)$/u.exec(slug);
    return pole ? `expertise-${pole[1]}` : 'home';
  };
  const src = new URLSearchParams(location.search).get('utm_source') || 'direct';
  const source = ['qr','facebook','x','tiktok','youtube'].includes(src) ? src : 'direct';
  let previous = '';
  function record(page) {
    if (!allowed.has(page) || page === previous) return;
    previous = page;
    const payload = JSON.stringify({type:'page_view',page,source});
    const queued = navigator.sendBeacon && navigator.sendBeacon('/api/analytics/event',new Blob([payload],{type:'application/json'}));
    if (!queued) fetch('/api/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
  }
  record(location.pathname === '/acces.html' ? 'qr-access' : fromHash());
  addEventListener('hashchange',()=>record(fromHash()));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    let host;try{host=new URL(link.href).hostname.toLowerCase();}catch{return;}
    const platform=host==='x.com'||host.endsWith('.x.com')?'x':host==='tiktok.com'||host.endsWith('.tiktok.com')?'tiktok':host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtu.be'?'youtube':host==='facebook.com'||host.endsWith('.facebook.com')?'facebook':'';
    if(!platform)return;
    const payload=JSON.stringify({type:'social_click',page:'social-links',source:platform});
    const queued=navigator.sendBeacon&&navigator.sendBeacon('/api/analytics/event',new Blob([payload],{type:'application/json'}));
    if(!queued)fetch('/api/analytics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
  });
})();
