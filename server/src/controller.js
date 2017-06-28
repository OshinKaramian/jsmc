/**
 * @file Controller for all server operations
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const file = require('./file.js');
let db = require('./db.js')();
let os = require('os');

module.exports.media = {
  /**
   * Gets a media object by ID
   */
  get: function(request, reply) {
    return db.getMedia(request.params.mediaId)
      .then(function(media) {
        if (!media) {
          return reply.status(404).send(`Media ID ${request.params.mediaId} does not exist.`);
        }
        return reply.json(media);
      })
      .catch(function(error) {
        throw error;
      });
  },

  /**
   * Gets a media object by query information
   */
  search: function(request, reply) {
    let query = request.query.query;
    return db.findMedia(query).then(function(mediaList) {
      return reply.json(mediaList);
    });
  }
};

/**
 * Gets config information for the server
 */
module.exports.config = {
  get: function(request, reply) {
    return fs.readJsonAsync('config/files_config.json').then(function(json) {
      return reply.json(json);
    });
  }
};

/**
 * Gets collection information by collection name
 */
module.exports.collection = {
  get: function(request, reply) {
    let name = request.params.collection;

    if (name) {
      return db.getCollection(name).then(function(docs) {
        return reply.json(docs);
      });
    } else {
      return fs.readJsonAsync('./config/files_config.json').then(function(filesConfig) {
        return reply.json(filesConfig);
      });
    }
  }
};

/**
 * Gets static files
 */
module.exports.static = {
  get: function(req, res) {
    console.log(req.url);
    res.sendFile(path.join(__dirname, '..', req.url));
  },

  mp4: function(req, res) {
    const mediaId = req.params.mediaId;
    const fileIndex = req.params.fileIndex || 0;

    db.getMedia(mediaId).then(doc => {
      console.log(doc.filedata[fileIndex]);
      return file.stats(doc.filedata[fileIndex])
    })
    .then(stat => {
      //const fileName = path.resolve(path.join('tests', 'files', 'testfile.mkv'));
      videoStream = file.transcode(stat.path);
      videoStream.onFinish(res.end);
      videoStream.transcode();

      res.header('Content-Type', 'video/mp4');
      res.header('Content-Length', stat.size);

      req.on('close', () => videoStream.end());

      videoStream.pipe(res);
    });
  }
};