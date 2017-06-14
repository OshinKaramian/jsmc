"use strict"
const hapi = require('hapi');
const inert = require('inert');
const server = new hapi.Server();
const controller = require('./src/controller.js');
const polo = require('polo');
const apps = polo();
const schedule = require('node-schedule');

//schedule.scheduleJob('10 * * * * *', () => {
//  console.log('checking temp dir');
//});

const SSDP = require('node-ssdp').Server;
const broadcast = new SSDP({
  //unicastHost: '192.168.11.63',
  location: require('ip').address() + '/desc.html',
  sourcePort: 1900
});

broadcast.addUSN('upnp:rootdevice')
broadcast.addUSN('urn:schemas-upnp-org:device:MediaServer:1')

broadcast.on('advertise-alive', function (heads) {
  //console.log('advertise-alive', heads)
// Expire old devices from your cache.
// Register advertising device somewhere (as designated in http headers heads)
})

broadcast.on('advertise-bye', function (heads) {
//  console.log('advertise-bye', heads)
// Remove specified device from cache.
})

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
  
  // start server on all interfaces
  broadcast.start()
});
