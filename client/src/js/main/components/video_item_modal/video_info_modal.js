"use strict";
const React = require('react');
const VideoFileDetail = require('./video_file_detail.js');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Tabs = require('react-simpletabs-alt');
var api = require('../../../common/api.js');

const episodeSort = (a, b) => {
  if (!a.episode || !b.episode) {
    return -1
  }

  if (a.episode.season_number > b.episode.season_number) {
    return 1;
  }

  if (a.episode.season_number < b.episode.season_number) {
    return -1;
  }

  if (a.episode.episode_number > b.episode.episode_number) {
    return 1;
  }

  if (a.episode.episode_number < b.episode.episode_number) {
    return -1;
  }

  // a must be equal to b
  return 0;
},

VideoBasicDetailsRow = React.createClass({
  render: function() {
    if (this.props.value) {
      return (
        <Row>
          <b><h6>{this.props.label}:</h6></b> <h5>{this.props.value}</h5>
        </Row>
      );
    } else {
      return (null);
    }
  }
}),

VideoBasicDetails = React.createClass({
  render: function() {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    const posterStyle = {
      borderStyle: 'solid',
      borderWidth: '5px'
    };

    return (
      <Row>
        <Col md={4}>
          <img src={api.BaseUrl + this.props.poster_path} width="100%" style={posterStyle}/>
        </ Col>
        <Col md={8}>
          <Row>
            <p>{this.props.long_plot}</p>
          </Row>
          <VideoBasicDetailsRow label="Rating" value={this.props.rated} />
          <VideoBasicDetailsRow label="Starring" value = {this.props.actors} />
          <VideoBasicDetailsRow label="Directed by" value={this.props.director} />
          <VideoBasicDetailsRow label="Written by" value={this.props.writer} />
          <VideoBasicDetailsRow label="Budget" value={formatter.format(this.props.budget)} />
          <VideoBasicDetailsRow label="Genres" value={this.props.genres.map(genre => genre.name).join(', ')} />
          <VideoBasicDetailsRow label="Awards" value={this.props.awards.map(award => award.category).join(', ')} />
          <VideoBasicDetailsRow label="IMDB Rating" value={this.props.imdb_rating} />
        </Col>
      </Row>
    );

  }
}),

VideoFileDetailsRow = React.createClass({
  playFile: function() {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + this.props.index;
  },

  render: function() {
    const
      columnStyle = {
        height: '24px',
        overflow: 'none'
      },
      rowStyle = {
        padding: '0px 0px 20px 0px',
      };

    return (
      <Row  key={this.props.index} style={rowStyle}>
        <Col md={1} style={columnStyle}>
          <button className="btn btn-default btn-sm" onClick={this.playFile}>
            <span  className="glyphicon glyphicon-play"></span>
          </button>
        </Col>;
        <Col md={10} style={columnStyle} >
          <div>{this.props.filename}</div>
        </Col>
      </Row>
    )
  }
}),

VideoFileDetails = React.createClass({
  render: function() {
    const nodes = this.props.files.map((filedata, index) =>
          <VideoFileDetailsRow key={index} {... this.props} index={index} filename={filedata.filename}/>);

    return (
      <div>
        <Col md={9}>{nodes}</Col>
      </div>
    );
  }
}),

VideoInfoModal = React.createClass({
  getInitialState: function() {
    return {
      currentFile: null
    };
  },

  componentDidMount: function() {
    let fileinfo = this.props.filedata[0];
    fileinfo.id = this.props.id;
    fileinfo.index = 0;
    this.setState({currentFile: fileinfo});
  },

  render: function() {
    const contentStyle = {
      padding:'25px'
    };

    let filesArray = this.props.filedata;

    if (filesArray[0].episode) {
      filesArray.sort(episodeSort);
    }

    console.log(this.props);

    return(
      <Tabs>
        <Tabs.Panel title='Details'>
          <div id="movie-details-panel" style={contentStyle}>
            <VideoBasicDetails {...this.props} />
          </div>
        </Tabs.Panel>
        <Tabs.Panel title='Files'>
          <div style={contentStyle}>
            <VideoFileDetails id={this.props.id} files={filesArray} />
          </div>
        </Tabs.Panel>
        <Tabs.Panel title='Editor'>
        </Tabs.Panel>
      </Tabs>
    )
  }
});

module.exports = VideoInfoModal;