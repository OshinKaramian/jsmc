"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var api = require('../common/api.js');
var myPlayer = videojs('my-video');
var queryString = require('query-string');

var transcodeAndRun = function() {
  var media = new api.Media();
  var transcodeRequestObject = queryString.parse(location.search);
  
  media.get(transcodeRequestObject.mediaId)
    .then(function(data) {
      console.log(data.backdrop_path);
      myPlayer.poster(data.backdrop_path);

      return media.transcode(transcodeRequestObject);
    })
    .then(function(data) {
      setTimeout(function() {
        console.log(data);
        console.log("http://localhost:3000/" + data);
        myPlayer.src({"src": "http://localhost:3000/" + data, "type":"application/x-mpegURL"});
        myPlayer.currentTime(0);
        myPlayer.play();
      }, 15000);
    });
};

myPlayer.ready(transcodeAndRun);
