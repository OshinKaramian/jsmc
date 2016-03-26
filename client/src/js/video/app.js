"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var api = require('../common/api.js');
var myPlayer =  videojs('my-video');

var queryString = require('query-string');
var initialPlayback = false;

var transcodeAndRun = function() {
  var media = new api.Media();
  var transcodeRequestObject = queryString.parse(location.search);
  
  media.get(transcodeRequestObject.mediaId)
    .then(function(data) {
      console.log(data.backdrop_path);
      //myPlayer.setAttribute('poster', data.backdrop_path);
      myPlayer.poster(data.backdrop_path);
      return media.transcode(transcodeRequestObject);
    })
    .then(function(data) {
      setTimeout(function() {
        console.log(data);
        myPlayer.src({"src": data, "type":"application/x-mpegURL"});
        myPlayer.play();
        myPlayer.currentTime(1);    
      }, 15000);
    });
};

$(document).ready(function() {
  transcodeAndRun();
});
