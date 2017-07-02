"use strict"
const express = require('express');
const schedule = require('node-schedule');
const SSDP = require('node-ssdp').Server;
const fileWatcher = require('./src/watchers/file_cleanup.js');
const controller = require('./src/controller.js');

const server = express();
/*
schedule.scheduleJob('10 * * * * *', () => {
  console.log('Running file cleanup');
  fileWatcher();
});
*/
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
  //console.log('advertise-bye', heads)
})


server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

server.post('/media/:mediaId/file/:fileIndex/transcode', controller.static.mp4);
server.get('/media', controller.media.search);
server.get('/media/:mediaId', controller.media.get);
server.get('/config/', controller.config.get);
server.get('/collections/:collection', controller.collection.get);
server.get('/*', controller.static.get);

server.listen(3000, function() { 
  console.log('Visit: http://127.0.0.1:3000') 
  broadcast.start();
});
// start server on all interfaces
server.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

