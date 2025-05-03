/* eslint-disable @typescript-eslint/no-require-imports */
const fastify = require('fastify');
const app = fastify({
  ignoreTrailingSlash: true,
});

app.register(require('../build/bootstrap').bootstrap);

async function handler(request, response) {
  await app.ready();
  app.server.emit('request', request, response);
}

module.exports = handler;
