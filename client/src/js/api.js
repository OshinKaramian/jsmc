var $ = require('jquery');
var baseApiUrl = 'http://localhost:3000/';

window.$ = window.jQuery = require('jquery');

module.exports.getCollection = function(collectionName) {
  return $.get(baseApiUrl + 'collections/' + collectionName);
};

module.exports.getConfig = function() {
  return $.get(baseApiUrl + 'config/');
}


