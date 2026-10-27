import 'server-only';
// The fictional pilot fixture must not become the institutional home page.
// An explicitly selected, published document can override the reference hero.
export async function publishedHome(locale){
 const id=process.env.CMS_HOME_DOCUMENT_ID;
 if(!id)return {content:null,state:'reference'};
 if(!/^[a-z0-9]+$/.test(id)||!process.env.CMS_CONTENT_READ_TOKEN)return {content:null,state:'unavailable'};
 try{
  const url=new URL(`/api/pages/${id}`,process.env.CMS_URL);url.searchParams.set('locale',locale);
  const response=await fetch(url,{headers:{Authorization:`Bearer ${process.env.CMS_CONTENT_READ_TOKEN}`},cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)return {content:null,state:response.status===404?'absent':'unavailable'};
  const {data}=await response.json();return {content:data||null,state:data?'published':'absent'};
 }catch{return {content:null,state:'unavailable'};}
}
