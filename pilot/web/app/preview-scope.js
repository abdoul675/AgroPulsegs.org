import {createHmac,timingSafeEqual} from 'node:crypto';
export const scopeCookie='agropulse-preview';
export function signScope(id,expires){return createHmac('sha256',process.env.PREVIEW_SECRET).update(`scope|${id}|${expires}`).digest('hex');}
export function validScope(value,id){
  const [expires,signature]=String(value||'').split('.');
  if(!/^\d+$/.test(expires)||Number(expires)<Date.now()||Number(expires)>Date.now()+300000)return false;
  const a=Buffer.from(signScope(id,expires));const b=Buffer.from(signature||'');
  return a.length===b.length&&timingSafeEqual(a,b);
}
