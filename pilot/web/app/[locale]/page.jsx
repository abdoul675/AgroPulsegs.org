import Script from 'next/script';
import {notFound} from 'next/navigation';
import layout from '../../content/home-layout.json';
import reference from '../../content/home-reference.json';
import {publishedHome} from '../home-content';
import '../reference-home.css';
export const dynamic='force-dynamic';
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const text=value=>String(value||'').replace(/<[^>]*>/g,'').replaceAll('&amp;','&');
function referenceTitle(value){return value.split(/(<em>.*?<\/em>)/g).map(part=>part.startsWith('<em>')?'<em>'+escape(text(part))+'</em>':escape(text(part))).join('');}
export async function generateMetadata({params}){
 const {locale}=await params;return {title:locale==='en'?'AgroPulse — Data for growth, youth for change!':'AgroPulse — Transformation digitale et verte',description:reference.hero.subtitle[locale==='en'?'en':'fr'],alternates:{languages:{fr:'/fr',en:'/en'}}};
}
export default async function Home({params}){
 const {locale}=await params;if(!['fr','en'].includes(locale))notFound();
 const home=await publishedHome(locale);const hero=home.content?.sections?.find(section=>section.__component==='content.hero');
 const title=hero?.title?escape(hero.title):referenceTitle(reference.hero.title[locale]);
 const intro=escape(hero?.intro||reference.hero.subtitle[locale]);
 let html=layout.variants[locale].replace('__AGROPULSE_HERO_TITLE__',()=>title).replace('__AGROPULSE_HERO_INTRO__',()=>intro);
 if(['absent','unavailable'].includes(home.state))html=html.replace('<main id="main">','<main id="main"><p role="status" class="w">'+(locale==='en'?'Updated content is temporarily unavailable. The reference presentation remains available.':'Le contenu actualisé est temporairement indisponible. La présentation de référence reste consultable.')+'</p>');
 return <>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;800&family=Figtree:wght@400;500;600&display=swap"/>
  <div className="reference-home" dangerouslySetInnerHTML={{__html:html}}/>
  <Script src="/reference/home-interactions.js?v=3" strategy="afterInteractive"/>
 </>;
}
