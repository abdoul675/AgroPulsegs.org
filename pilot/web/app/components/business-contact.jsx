'use client';
import {useEffect,useState} from 'react';
export default function BusinessContact({locale}){
 const en=locale==='en';const [ready,setReady]=useState(false),[prepared,setPrepared]=useState(false);
 useEffect(()=>setReady(true),[]);
 return <form id="f" className="business-form" method="dialog" onSubmit={event=>{event.preventDefault();setPrepared(true);}}>
  <div className="contact-fields"><div><label htmlFor="n">{en?'Full name':'Nom complet'}</label><input id="n" name="name" autoComplete="name" required maxLength={120}/></div><div><label htmlFor="e">{en?'Email address':'Adresse e-mail'}</label><input id="e" name="email" type="email" autoComplete="email" required maxLength={254}/></div></div>
  <div><label htmlFor="m">{en?'Tell us about your project':'Parlez-nous de votre projet'}</label><textarea id="m" name="message" rows={4} maxLength={5000} required/></div>
  <p className="form-note">{en?'This form prepares a draft. Sending is not enabled yet.':'Ce formulaire prépare un brouillon. L’envoi n’est pas encore activé.'}</p>
  <button className="business-button" type="submit" data-enable-draft="" disabled={!ready}>{en?'Prepare my enquiry':'Préparer ma demande'} <span aria-hidden="true">→</span></button>
  <p id="st" role="status" aria-live="polite">{prepared?(en?'Your draft is ready on this page. No message has been sent.':'Votre brouillon est prêt sur cette page. Aucun message n’a été envoyé.'):''}</p>
 </form>;
}
