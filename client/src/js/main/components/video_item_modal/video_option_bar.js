"use strict";
const React = require('react');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;

let VideoOptionBar = React.createClass({ 
  setEventListeners: function() {        
      /*document.addEventListener('keydown', function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);
        if (keyPressed === 'P') {
          this.playVideo();
        }
      }.bind(this)); 
      */
  },
  
  playVideo: function() {
    window.location = 'video.html?mediaId=' + this.props.videoId;
  },

  openInfo: function() {
    this.props.openInfo();
  },
  
  componentDidMount: function() {
    this.setEventListeners();
  },

  render: function() {
    return (
      <Row className="video-option-bar">
        <Col md={12}><button className="btn btn-default btn-lg btn=movie-play" onClick={this.openInfo}><span className="glyphicon glyphicon-info-sign"></span></button>
        <button className="btn btn-default btn-lg" onClick={this.playVideo}><span  className="glyphicon glyphicon-play"></span></button></Col>
      </Row>
    );
  }
})

module.exports = VideoOptionBar;