import React from 'react';
import logo from './extensions/agropulse-logo.png';
const VisualIcon=()=>React.createElement('svg',{width:24,height:24,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8,'aria-hidden':true},React.createElement('rect',{x:3,y:3,width:18,height:18,rx:3}),React.createElement('path',{d:'M3 9h18M9 9v12'}));
if(typeof window!=='undefined'&&!window.localStorage.getItem('strapi-admin-language'))window.localStorage.setItem('strapi-admin-language','fr');
export default {
 config:{
  locales:['fr','en'],auth:{logo},menu:{logo},head:{favicon:logo},tutorials:false,notifications:{releases:false},
  theme:{light:{colors:{primary100:'#edf7ed',primary200:'#cfe5ca',primary500:'#3f9a3c',primary600:'#28752c',primary700:'#1f5c23',neutral100:'#f6f8f4'}},dark:{colors:{primary100:'#203a29',primary200:'#2c5437',primary500:'#72bf68',primary600:'#8ed484',primary700:'#a5e39d'}}},
  translations:{fr:{'Auth.form.welcome.title':'Bienvenue chez AgroPulse','Auth.form.welcome.subtitle':'Un espace simple pour faire vivre votre site.','app.components.LeftMenu.navbrand.title':'AgroPulse','agropulse.visual':'Pilotage visuel','agropulse.quick':'Prendre en main le site'},en:{'Auth.form.welcome.title':'Welcome to AgroPulse','Auth.form.welcome.subtitle':'A simple workspace to keep your website up to date.','app.components.LeftMenu.navbrand.title':'AgroPulse','agropulse.visual':'Visual editor','agropulse.quick':'Manage your website'}},
 },
 register(app){
  app.addMenuLink({to:'plugins/agropulse-editor',icon:VisualIcon,intlLabel:{id:'agropulse.visual',defaultMessage:'Pilotage visuel'},Component:()=>import('./components/VisualEditor.jsx'),permissions:[{action:'plugin::content-manager.explorer.read',subject:'api::page.page'}]});
  if(app.widgets?.register)app.widgets.register({id:'agropulse-quick-start',icon:VisualIcon,title:{id:'agropulse.quick',defaultMessage:'Prendre en main le site'},component:async()=>(await import('./components/QuickStart.jsx')).default});
 },
 bootstrap(){},
};
