const {createRequire}=require('node:module');
let app,stopping=false;
async function stop(){if(stopping)return;stopping=true;if(app)await app.destroy();process.exit(0)}
process.on('message',message=>{if(message?.type==='stop')void stop()});
process.on('SIGTERM',()=>void stop());
(async()=>{
 if(process.env.AGROPULSE_PILOT_MODE!=='false'||process.env.DATABASE_NAME!=='agropulse_security_isolated'||process.env.HOST!=='127.0.0.1')throw Error('Refusing non-isolated CMS configuration');
 const appDir=process.env.AGROPULSE_SECURITY_APP_DIR;
 const requireCms=createRequire(appDir+'/package.json');
 const {createStrapi}=requireCms('@strapi/strapi');
 app=createStrapi({appDir,distDir:appDir});await app.start();
 const passwords=JSON.parse(process.env.AGROPULSE_SECURITY_PASSWORDS);
 for(const role of ['admin','editor','publisher']){
  const code=role==='admin'?'strapi-super-admin':'agropulse-'+role;
  const entity=await app.admin.services.role.findOne({code});if(!entity)throw Error('Missing configured role: '+role);
  await app.admin.services.user.create({email:role+'@security.agropulse.test',firstname:'Security',lastname:role,isActive:true,blocked:false,password:passwords[role],roles:[entity.id],preferedLanguage:'fr'});
 }
 const token=await app.admin.services['api-token'].create({name:'Isolated security read token',description:'Fictional disposable instance only',type:'custom',permissions:['api::page.page.find','api::page.page.findOne','api::programme.programme.find','api::programme.programme.findOne'],lifespan:604800000});
 const locales=await app.plugin('i18n').service('locales').find();
 process.send({type:'ready',readToken:token.accessKey,locales:locales.map(x=>x.code)});
})().catch(error=>{process.send?.({type:'failed',error:error.message});process.exitCode=1;void stop()});
