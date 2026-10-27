// Enable the two native interface languages. Preserve a user's explicit choice.
if(typeof window!=='undefined'&&!window.localStorage.getItem('strapi-admin-language'))window.localStorage.setItem('strapi-admin-language','fr');
export default {
  config:{locales:['fr','en'],translations:{fr:{'Auth.form.welcome.title':'Bienvenue dans AgroPulse','Auth.form.welcome.subtitle':'Connectez-vous pour gérer les contenus du site.'},en:{'Auth.form.welcome.title':'Welcome to AgroPulse','Auth.form.welcome.subtitle':'Sign in to manage website content.'}}},
  bootstrap(){}
};
