'use client';
import {useState} from 'react';
export default function SiteHeader({locale,logo}){
 const [open,setOpen]=useState(false);const en=locale==='en';
 const links=[['#top',en?'Home':'Accueil'],['#expertises',en?'Expertise':'Expertises'],['#fellowship','Fellowship'],['#agir-ia','AGIR-IA'],['#ancrage',en?'Our presence':'Notre ancrage'],['#contact',en?'Contact':'Contacts']];
 return <header className="site-header"><div className="w bar"><a href={`/${locale}`} aria-label="AgroPulse Global Solutions"><img src={logo} alt="AgroPulse Global Solutions" width="186" height="54"/></a><nav id="site-navigation" className={open?'open':''} aria-label={en?'Main navigation':'Navigation principale'}><ul>{links.map(([href,label])=><li key={href}><a href={href} onClick={()=>setOpen(false)}>{label}</a></li>)}</ul></nav><div className="tools"><a className="lang" href={`/${en?'fr':'en'}`} hrefLang={en?'fr':'en'} aria-label={en?'Passer en français':'Switch to English'}>{en?'FR':'EN'}</a><a className="btn cta" href="#contact">{en?'Request a quote':'Demander un devis'}</a><button className="menu-toggle" type="button" aria-label={en?'Menu':'Menu'} aria-expanded={open} aria-controls="site-navigation" onClick={()=>setOpen(!open)}>☰</button></div></div></header>;
}
