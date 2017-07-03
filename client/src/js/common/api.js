"use strict";
let baseApiUrl = 'http://' + location.host.split(':')[0] + ':3000/';

module.exports.BaseUrl = baseApiUrl;

if (window && window.process && window.process.type) {
  let ipc = require('electron').ipcRenderer;

  ipc.on('updateJsmcUrl', function(event, message) {
    baseApiUrl = message;
    module.exports.BaseUrl = baseApiUrl;
  });

  ipc.on('api-url', function(event, message) {
    baseApiUrl = message;
    module.exports.BaseUrl = baseApiUrl;
  });

  ipc.send('request-api-url', '');
}

module.exports.media = {
  /**
   * Given a media ID gets the media object
   *
   * @param {number} mediaId
   * @returns media object
   */
  get: function(mediaId) {
    return fetch(baseApiUrl + 'media/' + mediaId).then(function(response) {
      return response.json();
    });
  },

  /**
   * Starts transcoding given file if not yet transcoded
   *
   * @param {number} {mediaId: mediaId, fileIndex: fileIndex = 0} id of media object and optional index of file
   * @returns URL of transcoded media resource (as an HLS manifest)
   */
  transcode: function({mediaId: mediaId, fileIndex: fileIndex = 0}) {
    return fetch(baseApiUrl + 'media/' + mediaId + '/file/' + fileIndex + '/transcode', { method: 'post'}).then(function(response) {
      return response.text();
    });
  },

  mp4Url: function({mediaId: mediaId, fileIndex: fileIndex = 0}) {
    return baseApiUrl + 'tmp/' + mediaId + '_' + fileIndex + '.m3u8';
  },

  /**
   * Queries media database for matching entries
   *
   * @param {string} query search term querying the database
   * @returns Array of matching media objects
   */
  search: function(query) {
    return fetch(baseApiUrl + 'media?query=' + query).then(function(response) {
      return response.json();
    });
  }
}

module.exports.collection = {
  /**
   * Gets all media for a given collection
   *
   * @param {string} collectionName Id of collection to get information of
   * @returns Array of values matching collectionName
   */
  get: function(collectionName) {
    return fetch(baseApiUrl + 'collections/' + collectionName).then(function(response) {
      return response.json();
    });
  }
}

module.exports.config = {
  /**
   *
   *
   * @returns
   */
  get: function() {
    return fetch(baseApiUrl + 'config/').then(function(response) {
      return response.json();
    });
  }
}