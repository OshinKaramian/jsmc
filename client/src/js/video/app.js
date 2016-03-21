"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var api = require('../common/api.js');
//var Hls = require('hls.js');
//var myPlayer =  document.getElementById('my-video');
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
        console.log("http://localhost:3000/" + data);
        myPlayer.src({"src": "http://localhost:3000/" + data, "type":"application/x-mpegURL"});
        myPlayer.currentTime(0);
        myPlayer.play();
        /*var hls = new Hls();
        
        hls.loadSource("http://localhost:3000/" + data);
        hls.attachMedia(myPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
          
          
          myPlayer.addEventListener("canplay",function() { 
            if (!initialPlayback) {
              myPlayer.play();
              myPlayer.currentTime = 0;
              
              initialPlayback = true;
            }
          });
          
        });
        */
      }, 15000);
    });
};

$(document).ready(function() {
  transcodeAndRun();
});
