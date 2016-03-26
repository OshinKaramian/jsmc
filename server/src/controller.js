"use strict";
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const file = require('./file.js');
let db = require('./db.js')();

module.exports.media = {
  transcode: function(request, reply) {
    let mediaId = request.params.mediaId;
    let fileIndex = request.params.fileIndex || 0;
    file.transcode('movies', mediaId, fileIndex).then(function(filePath) {
      return reply('http://' + address + ':3000/' + filePath);
    }).catch(function(error) {
      console.log(error);
    });
  },

  get: function(request, reply) {
    return db.getMedia(request.params.mediaId).then(function(media) {
      if (!media) {
        return reply(`Media ID ${request.params.mediaId} does not exist.`).code(404);
      }
      return reply(media).header('Content-Type', 'application/json');
    })
    .catch(function(error) {
      throw error;
    });
  },
  
  search: function(request, reply) {
    let query = request.query.query;
    console.log(query);
    return db.findMedia(query).then(function(mediaList) {
      return reply(mediaList).header('Content-Type', 'application/json');
    });
  }
}

module.exports.config = {    
  get: function(request, reply) {
    return fs.readJsonAsync('config/files_config.json').then(function(json) {
      return reply(json).header('Content-Type', 'application/json');
    });
  }
}

module.exports.collection = {    
  get: function(request, reply) {
    let name = request.params.collection;

    if (name) {
      return db.getCollection(name).then(function(docs) {
        return reply(docs).header('Content-Type', 'application/json');
      });
    } else {
      return fs.readJsonAsync('./config/files_config.json').then(function(filesConfig) {
        return reply(filesConfig).header('Content-Type', 'application/json');
      });
    }
  }
}

module.exports.static = {
  get: function(request, reply) {
    if (path.extname(request.params.file) === '.ts') {
      reply.file(request.params.file).header('Content-Type', 'application/vnd.apple.mpegurl');
    } else {
      reply.file(request.params.file);
    }
  }
}