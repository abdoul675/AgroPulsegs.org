const strapi = require('@strapi/strapi');

async function start() {
  const app = strapi.createStrapi();
  await app.start();
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
