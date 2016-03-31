"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var api = require('../common/api.js');
var myPlayer =  videojs('my-video');
var queryString = require('query-string');
var backButton = $('.vjs-back-button');
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

(function(window, videojs) {
  backButton.click(function(event) {
    window.history.back();
  });
  
  backButton.mouseover(function(event) {
    backButton.addClass('glow');
    backButton.show();
  });
  
  backButton.mouseout(function(event) {
    backButton.removeClass('glow');
  });
  
  myPlayer.on('mouseover', function() {
    backButton.show();
  });
  
  myPlayer.on('mouseout', function() {
    backButton.hide()
  });
}(window, window.videojs));

if (window && window.process && window.process.type) {
  var ipc = require('electron').ipcRenderer;
  
  ipc.on('data-loaded', function(event, message) {
    transcodeAndRun();
  });
}  else {
  $(document).ready(function() {
    transcodeAndRun();
  });
}

