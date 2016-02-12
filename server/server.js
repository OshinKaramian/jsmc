"use strict"

const hapi = require('hapi');
const inert = require('inert');
const server = new hapi.Server();
const fs = require('fs-extra');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const file = require('./src/file.js');
const db = require('./src/db.js');

let transcode = function(request, reply) {
  console.log(request.params);
  var mediaId = request.params.mediaId;
  var fileIndex = request.params.fileIndex || 0;
  file.transcode('movies', mediaId, fileIndex).then(function(filePath) {
    return reply(filePath);
  });
};

server.register(inert, function () {

  server.connection({ port: 3000, routes: { cors: true}});

  server.route( {
    method: 'POST',
    path: '/media/{mediaId}/file/{fileIndex}/transcode',
    handler: transcode
  });

  server.route({
    method: 'GET',
    path: '/media/{mediaId*}',
    handler: function (request, reply) {
      db.getMedia('movies', request.params.mediaId).then(function(media) {
        return reply(media).header('Content-Type', 'application/json');
      })
    }
  });

  server.route({
    method: 'GET',
    path: '/config/',
    handler: function (request, reply) {
      fs.readJson('config/files_config.json', function (err, json) {
       return reply(json).header('Content-Type', 'application/json');
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/collections/{collection*}',
    handler: function (request, reply) {
      debugger;
     var name = request.params.collection;

     if (name) {
       db.getCollection('movies', name).then(function(docs) {
         return reply(docs).header('Content-Type', 'application/json');
       });
     } else {
       fs.readJson('./config/files_config.json', function(err, filesConfig) {
         return reply(filesConfig).header('Content-Type', 'application/json');
       });
     }
    }
   });

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: function (request, reply) {
      if (path.extname(request.params.file) === '.ts') {
        reply.file(request.params.file).header('Content-Type', 'application/vnd.apple.mpegurl');
      } else {
        reply.file(request.params.file);
      }
     }
  });

  server.start(function() { console.log('Visit: http://127.0.0.1:3000') });
});
