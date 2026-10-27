import {draftMode,cookies} from 'next/headers';
import {scopeCookie,validScope} from '../../../preview-scope';
import {notFound} from 'next/navigation';
import Link from 'next/link';
export const dynamic='force-dynamic';
export default async function Expertise({params}){
  const {locale,documentId}=await params;
  if(!['fr','en'].includes(locale)||documentId!==process.env.PILOT_DOCUMENT_ID)notFound();
  const preview=(await draftMode()).isEnabled&&validScope((await cookies()).get(scopeCookie)?.value,documentId);
  const base=process.env.CMS_URL;
  const endpoint=preview?`${base}/api/pilot-preview/${documentId}?locale=${locale}`:`${base}/api/expertises/${documentId}?locale=${locale}`;
  const headers=preview?{'x-pilot-preview-secret':process.env.PREVIEW_SECRET}:{Authorization:`Bearer ${process.env.CMS_READ_TOKEN}`};
  const response=await fetch(endpoint,{headers,cache:'no-store'});
  if(response.status===404)notFound();
  if(!response.ok)throw new Error('Le contenu du pilote est temporairement indisponible.');
  const {data}=await response.json();if(!data)notFound();
  const en=locale==='en';
  return <main>
    <header><Link href={`/${locale}/expertise/${documentId}`}>AgroPulse <span>Global Solutions</span></Link><nav aria-label={en?'Languages':'Langues'}><Link href={`/fr/expertise/${documentId}`} hrefLang="fr" aria-current={locale==='fr'?'page':undefined}>FR</Link><Link href={`/en/expertise/${documentId}`} hrefLang="en" aria-current={locale==='en'?'page':undefined}>EN</Link></nav></header>
    <p className="notice">{en?'Local technical pilot · Test data':'Pilote technique local · Données fictives'}</p>
    {preview&&<aside className="preview" role="status">{en?'Draft preview — unpublished content':'Prévisualisation du brouillon — contenu non publié'} · <a href={`/api/exit-preview?locale=${locale}`}>{en?'Exit preview':'Quitter la prévisualisation'}</a></aside>}
    <article><p className="eyebrow">{en?'EXPERTISE':'EXPERTISE'} / {data.code}</p><h1>{data.title|| (en?'Untitled draft':'Brouillon sans titre')}</h1><p className="lead">{data.summary}</p><p className="body">{data.body}</p></article>
    <footer>{en?'This pilot does not send forms or collect applications.':'Ce pilote n’envoie aucun formulaire et ne collecte aucune candidature.'}</footer>
  </main>;
}
