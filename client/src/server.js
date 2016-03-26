var
  hapi = require('hapi'),
  inert = require('inert'),
  server = new hapi.Server(),
  polo = require('polo'),
  apps = polo();

server.register(inert, function () {

  server.connection({ port: 8000});

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: { path: 'dist' }
     }
  });

  server.start(function() { 
    console.log('Visit: http://127.0.0.1:8000');
  });
  
}); // requires a callback function but can be blank
