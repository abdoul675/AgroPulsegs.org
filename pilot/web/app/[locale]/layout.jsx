import '../style.css';
export const metadata={title:'AgroPulse — Pilote CMS local',robots:{index:false,follow:false}};
export default async function Layout({children,params}){
  const {locale}=await params;
  return <html lang={locale==='en'?'en':'fr'}><body>{children}</body></html>;
}
