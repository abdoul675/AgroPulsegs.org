'use strict';
const {createCoreRouter}=require('@strapi/strapi').factories;
module.exports=createCoreRouter('api::expertise.expertise',{only:['find','findOne']});
