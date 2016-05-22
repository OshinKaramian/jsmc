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

module.exports.Media = class Media {
  constructor() {
  }
  
  get(mediaId) {
    return fetch(baseApiUrl + 'media/' + mediaId).then(function(response) {
      return response.json();
    });
  }
  
  transcode({mediaId: mediaId, fileIndex: fileIndex = 0}) {
    return fetch(baseApiUrl + 'media/' + mediaId + '/file/' + fileIndex + '/transcode', { method: 'post'}).then(function(response) {
      return response.json();
    });
  }
  
  search(query) {
    return fetch(baseApiUrl + 'media?query=' + query).then(function(response) {
      return response.json();
    });
  }
}

module.exports.Collection = class Collection {
  constructor(name) {
    this.name = name; 
  }

  get(collectionName) {
    if (!collectionName) {
      collectionName = this.name;
    }
    
    return fetch(baseApiUrl + 'collections/' + collectionName).then(function(response) {
      return response.json();
    });
  }
}

module.exports.Config = class Config {
  contructor() {
  }

  get() {
    return fetch(baseApiUrl + 'config/').then(function(response) {
      return response.json();
    });
  }
}
