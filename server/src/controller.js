/**
 * @file Controller for all server operations
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const file = require('./file.js');
const config = require('../config/');
const DirectoryManager = require('./directory_manager.js');
const transcodeList = [];
const transcodeResProcess = [];
let db = require('./db.js')();

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
          //setTimeout(function() {
          //  fs.remove(path.join(__dirname, '..', req.url));
          //}, 60000);
        }
      }
    });
  },

  mp4: function(req, res) {
    console.log('start transcode ' + req.url);
    const mediaId = req.params.mediaId;
    const fileIndex = req.params.fileIndex || 0;
    const dm = new DirectoryManager(config.serverOptions.TEMP_DIR);
    if (!transcodeResProcess[mediaId]) {
      transcodeResProcess[mediaId] = 'in_process';
    }

    return dm.init()
      .then(() => dm.clearTsFiles(mediaId))
      .then(() => db.getMedia(mediaId))
      .then(doc => {
        console.log(doc.filedata[fileIndex]);
        return file.stats(doc.filedata[fileIndex]);
      })
      .then(stat => {
        let videoStream;
        if (transcodeList[mediaId]) {
          videoStream = transcodeList[mediaId];
        } else {
          file.extractSubtitle(stat.path, mediaId, fileIndex);
          videoStream = file.transcode(stat.path, mediaId, fileIndex);
          transcodeList[mediaId] = videoStream;
        }
        console.log(transcodeResProcess[mediaId]);

        if (transcodeResProcess[mediaId] !== 'in_process') {
          return res.send();
        }

        videoStream.on('progress', progress => {
          const time = progress.timemark.split(':');
          const minutes = parseInt(time[1]);
          if (minutes > 1) {
            transcodeResProcess[mediaId] = 'complete';
            return res.send();
          }
        });

        videoStream.on('end', function() {
          console.log('Finished transcoding ' + file);
          const mediaIndex = transcodeList.indexOf(mediaId);
          transcodeList.splice(mediaIndex, 1);
        });
      });
  }
};