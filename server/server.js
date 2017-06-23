"use strict"
const hapi = require('hapi');
const inert = require('inert');
const schedule = require('node-schedule');
const SSDP = require('node-ssdp').Server;
const server = new hapi.Server();
const fileWatcher = require('./src/watchers/file_cleanup.js');
const controller = require('./src/controller.js');

schedule.scheduleJob('10 * * * * *', () => {
  console.log('Running file cleanup');
  fileWatcher();
});

const broadcast = new SSDP({
  //unicastHost: '192.168.11.63',
  location: require('ip').address() + '/desc.html',
  sourcePort: 1900
});

broadcast.addUSN('upnp:rootdevice')
broadcast.addUSN('urn:schemas-upnp-org:device:MediaServer:1')

broadcast.on('advertise-alive', function (heads) {
  //console.log('advertise-alive', heads)
})

broadcast.on('advertise-bye', function (heads) {
//  console.log('advertise-bye', heads)
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
  broadcast.start();
});
