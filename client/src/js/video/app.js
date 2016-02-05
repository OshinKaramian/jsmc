"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var api = require('../common/api.js');
var myPlayer = videojs('my-video');

var transcodeAndRun = function() {
  var media = new api.Media();
  var transcodeRequestObject = {};
  
  transcodeRequestObject.mediaId = $.getUrlVar('filename');
  if ($.getUrlVar('fileId')) {
    transcodeRequestObject.fileIndex = $.getUrlVar('fileId');
  }
  
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

myPlayer.ready(function() {
  $.extend({
    getUrlVars: function(){
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },
    getUrlVar: function(name){
      return $.getUrlVars()[name];
    }
  });
  transcodeAndRun();
});
