"use strict";
const React = require('react');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;

let VideoFileDetail = React.createClass({
  playFile: function() {
    window.location = 'video.html?mediaId=' + this.props.file.id + '&fileIndex=' + this.props.file.index;
  },

  render: function() {
    if (!this.props.file || !this.props.file.episode) {
      return <div></div>;
    }

    let rowStyle = { paddingBottom: '10px' };

    let backgroundImage = {
      backgroundImage: 'url(' + this.props.file.episode.still_path + ')',
      minHeight : '55%',
      backgroundSize: 'cover',
      padding:'10px'
    };
    let playButton = {
      'color':'white'
    }

    return (
      <div>
        <Row style={rowStyle}>
          <Col md={12}>
            <div style={backgroundImage}>
              <i style={playButton} onClick={this.playFile} className="fa fa-play-circle fa-5x" aria-hidden="true"></i>
            </div>
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={1}>
            <b>Season: </b>
          </Col>
          <Col md={2}>
            {this.props.file.episode.season_number}
          </Col>
          <Col md={1}>
            <b>Episode: </b>
          </Col>
          <Col md={2}>
            {this.props.file.episode.episode_number}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={2}>
            <b>File: </b>
          </Col>
          <Col md={9}>
            {this.props.file.filename}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={2}>
            <b>Overview: </b>
          </Col>
          <Col md={9}>
            {this.props.file.episode.overview}
          </Col>
        </Row>
      </div>
    )
  }
});

module.exports = VideoFileDetail;