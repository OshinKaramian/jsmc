"use strict";
const $ = require('jquery');
window.videojs = require('video.js');
window.$ = window.jQuery = require('jquery');
const api = require('../common/api.js');
const myPlayer =  videojs('my-video');
const queryString = require('query-string');
const backButton = $('.vjs-back-button');
require('videojs-contrib-hls');

var transcodeAndRun = function() {
  var transcodeRequestObject = queryString.parse(location.search);
  var mediaInfo = {};
  var durationSet = false;

  api.media.get(transcodeRequestObject.mediaId)
    .then(function(data) {
      myPlayer.loadingSpinner.show();
      console.log(data.backdrop_path);
      try {
        myPlayer.poster(api.BaseUrl + data.backdrop_path);
      } catch (exception) {
        console.log(exception);
      }
      mediaInfo = data;
      return api.media.transcode(transcodeRequestObject);
    })
    .then(function(data) {
      console.log(data);
      myPlayer.duration = () =>{
        var fileIndex = transcodeRequestObject.fileIndex || 0;
        return mediaInfo.filedata[fileIndex].duration;
      };
      
      myPlayer.src({"src": api.media.mp4Url(transcodeRequestObject), "type":"application/x-mpegURL"});
      myPlayer.play();
      myPlayer.one('canplay', () => {
        myPlayer.pause();
        myPlayer.currentTime(1);
        myPlayer.play();
      });
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

  ipc.on('api-url', function(event, message) {
    transcodeAndRun();
  });

  ipc.send('request-api-url', '');
}  else {
  $(document).ready(function() {
    transcodeAndRun();
  });
}

