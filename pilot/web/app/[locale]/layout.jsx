import '../typography.css';
import '../business.css';
export const metadata={title:'AgroPulse — Pilote CMS local',robots:{index:false,follow:false},icons:{icon:[{url:'/brand-icon.svg?v=2',type:'image/svg+xml'}]}};
export default async function Layout({children,params}){
  const {locale}=await params;
  return <html lang={locale==='en'?'en':'fr'}><body>{children}</body></html>;
}
