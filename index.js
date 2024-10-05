const fastify = require('fastify')();
const puppeteer = require('puppeteer');
const port = process.env.APP_PORT || 8004;

fastify.get('/', () => {
  return { message: 'RPA Yafacture' };
});

fastify.post('/constancia-situacion-fiscal', async (request, reply) => {
  const payload = request?.body;
  const constanciaSituacionFiscal = require('./rpa/constanciaSituacionFiscal');
  const args = { ...payload, puppeteer };
  const rpa = await constanciaSituacionFiscal(args);
  reply.send(rpa);
});

fastify.post('/opinion-cumplimiento', async (request, reply) => {
  const payload = request?.body;
  const opinionCumplimento = require('./rpa/opinionCumplimiento');
  const args = { ...payload, puppeteer };
  const rpa = await opinionCumplimento(args);
  reply.send(rpa);
});

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  console.log(`\n🚀 Ready on port ${port} `);
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
