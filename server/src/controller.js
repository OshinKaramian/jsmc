/**
 * @file Controller for all server operations
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const file = require('./file.js');
const Media = require('./media.js');
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
        docs.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }

          if (a.title > b.title) {
            return 1;
          }

          return 0;
        });
        return reply.json(docs);
      });
    } else {
      return fs.readJsonAsync('./config/files_config.json').then(function(filesConfig) {
        return reply.json(filesConfig);
      });
    }
  },

  genres: function(req, res) {
    let { collection = '' } = req.params;

    return db.getAllGenres(collection)
      .then(genres => res.json({ items: genres }));
  },

  getByGenreName: function(req, res) {
    let { genre = '' } = req.params;

    return db.getByGenre(genre)
      .then(files => res.json({ items: files } ));
  }
};

/**
 * Gets static files
 */
module.exports.static = {
  get: function(req, res) {
    console.log(req.url);
    console.log('static');
    res.sendFile(path.join(__dirname, '..', req.url), {}, err => {
      if (!err) {
        if (path.extname(req.url) === '.ts') {
          setTimeout(function() {
            fs.remove(path.join(__dirname, '..', req.url));
          }, 60000);
        }
      }
    });
  },

  mp4: function(req, res) {
    const mediaId = req.params.mediaId;
    const fileIndex = req.params.fileIndex || 0;

    db.getMedia(mediaId).then(doc => {
      console.log(doc.filedata[fileIndex]);
      return file.stats(doc.filedata[fileIndex])
    })
    .then(stat => {
      const videoStream = file.transcode(stat.path, mediaId, fileIndex);
      videoStream.on('progress', progress => {
        const time = progress.timemark.split(':');
        const seconds = parseInt(time[2]);
        if (seconds > 45) {
          return res.send();
        }
      });
    });
  }
};