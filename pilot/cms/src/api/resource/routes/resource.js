'use strict';
module.exports=require('@strapi/strapi').factories.createCoreRouter('api::resource.resource',{only:["find","findOne"]});
