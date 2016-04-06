"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const api = require('../common/api.js');
const myPlayer =  videojs('my-video');
const queryString = require('query-string');
const backButton = $('.vjs-back-button');

var transcodeAndRun = function() {
  var media = new api.Media();
  var transcodeRequestObject = queryString.parse(location.search);
  
  media.get(transcodeRequestObject.mediaId)
    .then(function(data) {
      console.log(data.backdrop_path);
      myPlayer.poster(api.BaseApiUrl + data.backdrop_path);
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
  let ipc = require('electron').ipcRenderer;
  
  ipc.on('data-loaded', function(event, message) {
    transcodeAndRun();
  });
}  else {
  $(document).ready(function() {
    transcodeAndRun();
  });
}

