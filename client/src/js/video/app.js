"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const api = require('../common/api.js');
const myPlayer =  videojs('my-video');
const queryString = require('query-string');
const backButton = $('.vjs-back-button');

var transcodeAndRun = function() {
  var transcodeRequestObject = queryString.parse(location.search);

  api.media.get(transcodeRequestObject.mediaId)
    .then(function(data) {
      console.log(data.backdrop_path);
      try {
        myPlayer.poster(api.BaseUrl + data.backdrop_path);
      } catch (exception) {
        console.log(exception);
      }

      var sourceUrl = api.media.mp4Url(transcodeRequestObject);


/*myPlayer.duration = function() {
  return 10000;
};*/

      myPlayer.src({src: sourceUrl, type:"video/mp4"});
      myPlayer.play();
     // myPlayer.currentTime(1);
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

