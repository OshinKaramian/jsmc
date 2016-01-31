"use strict";
var $ = require('jquery');
var baseApiUrl = 'http://localhost:3000/';

window.$ = window.jQuery = require('jquery');

module.exports.media = class Media {
  constructor() {
  }




},

module.exports.collection = class Collection {
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

module.exports.config = class Config {
  contructor() {
  }

  get() {
    return $.get(baseApiUrl + 'config/');
  }
}
