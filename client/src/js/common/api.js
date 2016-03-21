"use strict";
var $ = require('jquery');
var baseApiUrl = 'http://localhost:3000/';

window.$ = window.jQuery = require('jquery');

module.exports.Media = class Media {
  constructor() {
  }
  
  get(mediaId) {
    return $.get(baseApiUrl + 'media/' + mediaId);
  }
  
  transcode({mediaId: mediaId, fileIndex: fileIndex = 0}) {
    return $.post(baseApiUrl + 'media/' + mediaId + '/file/' + fileIndex + '/transcode');
  }
  
  search(query) {
    return $.get(baseApiUrl + 'media?query=' + query);
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

    return $.get(baseApiUrl + 'collections/' + collectionName);
  }
}

module.exports.Config = class Config {
  contructor() {
  }

  get() {
    return $.get(baseApiUrl + 'config/');
  }
}
