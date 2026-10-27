import {draftMode} from 'next/headers';
import {NextResponse} from 'next/server';
import {scopeCookie} from '../../preview-scope';
export async function GET(request){
  (await draftMode()).disable();const locale=new URL(request.url).searchParams.get('locale')==='en'?'en':'fr';
  const response=NextResponse.redirect(new URL(`/${locale}/expertise/${process.env.PILOT_DOCUMENT_ID}`,'http://127.0.0.1:3100'));response.cookies.delete(scopeCookie);response.headers.set('Cache-Control','private, no-store');return response;
}
