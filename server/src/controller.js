/**
 * @file Controller for all server operations
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const Writeable = require('stream').Writable;
const Readable = require('stream').Readable;
const path = require('path');
const file = require('./file.js');
let db = require('./db.js')();
let os = require('os');
let ifaces = os.networkInterfaces();

module.exports.media = {
  /**
   * Sends a request to transcode a file and returns a path to the manifest file
   */
  transcode: function(request, reply) {
    let mediaId = request.params.mediaId;
    let fileIndex = request.params.fileIndex || 0;
    let address;

    // Get current IP
    for (let dev in ifaces) {
      let iface = ifaces[dev].filter(function(details) {
        return details.family === 'IPv4' && details.internal === false;
      });

      if (iface.length > 0) {
        address = iface[0].address;
      }
    }

    file.transcode('movies', mediaId, fileIndex)
      .then(filePath => reply('http://' + address + ':3000/' + filePath))
      .catch(function(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-disable no-console */
      });
  },

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
  get: function(request, reply) {
    console.log(request.url);
    reply.sendFile(path.join(__dirname, '..', request.url));
  },

  getMp4: function(request, reply) {
    const mediaId = request.params.mediaId;
    const fileIndex = request.params.fileIndex || 0;

    db.getMedia(mediaId).then(doc => {
      const videostream = new Writeable();
      const fileName = doc.filedata[fileIndex].filename;
      //const fileName = path.resolve(path.join('tests', 'files', 'Gangs.Of.New.York.mkv'));
      file.transcodeFile(fileName, videostream);

      videostream._write = function(chunk, enc, next) {
        reply.write(chunk);
        next();
      };

      videostream.on('finish', () => {
        console.log('sad');
        return reply.end();
      })
    });
  }
};