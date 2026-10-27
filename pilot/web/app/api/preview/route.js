import {draftMode} from 'next/headers';
import {NextResponse} from 'next/server';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {scopeCookie,signScope} from '../../preview-scope';
export async function GET(request){
  const u=new URL(request.url);const id=u.searchParams.get('documentId');const locale=u.searchParams.get('locale');const expires=u.searchParams.get('expires');const signature=u.searchParams.get('signature')||'';
  if(!['fr','en'].includes(locale)||id!==process.env.PILOT_DOCUMENT_ID||!/^\d+$/.test(expires||''))return new NextResponse('Invalid preview request',{status:401});
  const expiration=Number(expires);if(expiration<Date.now()||expiration>Date.now()+300000)return new NextResponse('Expired preview request',{status:401});
  const expected=createHmac('sha256',process.env.PREVIEW_SECRET).update(`${id}|${locale}|${expires}`).digest('hex');
  const a=Buffer.from(expected);const b=Buffer.from(signature);
  if(a.length!==b.length||!timingSafeEqual(a,b))return new NextResponse('Unauthorized preview',{status:401});
  (await draftMode()).enable();
  const response=NextResponse.redirect(new URL(`/${locale}/expertise/${id}`,'http://127.0.0.1:3100'));
  response.cookies.set(scopeCookie,`${expires}.${signScope(id,expires)}`,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:Math.max(0,Math.floor((expiration-Date.now())/1000))});
  response.headers.set('Cache-Control','private, no-store');return response;
}
