var
  hapi = require('hapi'),
  inert = require('inert'),
  server = new hapi.Server({ port: 8000});

const init = async () => {

  await server.register(require('inert'));
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: { path: 'dist' }
     }
  });
  

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();