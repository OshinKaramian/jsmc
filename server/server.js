"use strict"
const hapi = require('hapi');
const inert = require('inert');
const server = new hapi.Server();
const controller = require('./src/controller.js');
const polo = require('polo');
const apps = polo();
let os = require('os');
let address;
let ifaces = os.networkInterfaces = () => ({});

for (let dev in ifaces) {
  let iface = ifaces[dev].filter(function(details) {
      return details.family === 'IPv4' && details.internal === false;
  });

  if (iface.length > 0) {
    address = iface[0].address;
  }
}

server.register(inert, function () {

  server.connection({ port: 3000, routes: { cors: true}});

  server.route({
    method: 'GET',
    path: '/media',
    handler: controller.media.search
  });

  server.route( {
    method: 'POST',
    path: '/media/{mediaId}/file/{fileIndex}/transcode',
    handler: controller.media.transcode
  });

  server.route({
    method: 'GET',
    path: '/media/{mediaId*}',
    handler: controller.media.get
  });

  server.route({
    method: 'GET',
    path: '/config/',
    handler: controller.config.get
  });

  server.route({
    method: 'GET',
    path: '/collections/{collection*}',
    handler: controller.collection.get
   });

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: controller.static.get
  });

  server.start(function() { console.log('Visit: http://127.0.0.1:3000') });
  
  apps.put({
    name:'jsmc', 
    host: address,
    port: 3000        
  });
});
