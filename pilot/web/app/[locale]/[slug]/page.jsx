import Script from 'next/script';
import {notFound} from 'next/navigation';
import layouts from '../../../content/interior-layouts.json';
import '../../interior-reference.css';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){
 const {locale,slug}=await params;const page=Object.hasOwn(layouts.pages,slug)?layouts.pages[slug]:null;
 if(!page||!['fr','en'].includes(locale))return {};
 return {title:`${page.title[locale]||page.title.fr} — AgroPulse Global Solutions`,alternates:{languages:{fr:`/fr/${slug}`,en:`/en/${slug}`}}};
}
export default async function InteriorPage({params}){
 const {locale,slug}=await params;const page=Object.hasOwn(layouts.pages,slug)?layouts.pages[slug]:null;
 if(!page||!['fr','en'].includes(locale))notFound();
 return <>
  <div className="interior-reference" dangerouslySetInnerHTML={{__html:page.locales[locale]}}/>
  <Script src="/reference/concise-interactions.js?v=1" strategy="afterInteractive"/>
 </>;
}
