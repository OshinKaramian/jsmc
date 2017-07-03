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
    const buttonCss = {
      'WebkitBorderRadius': '0',
      color: '#ffffff',
      background: '#000000',
      textDecoration: 'none',
      padding: '4px'
    }
    return (
      <Row className="video-option-bar">
        <Col md={12}><button className="btn btn-default btn-lg btn=movie-play" style={buttonCss} onClick={this.openInfo}><span className="fa fa-info-circle fa-2x"></span></button>
        <button className="btn btn-default btn-lg" style={buttonCss} onClick={this.playVideo}><span  className="fa fa-play-circle fa-2x"></span></button></Col>
      </Row>
    );
  }
})

module.exports = VideoOptionBar;