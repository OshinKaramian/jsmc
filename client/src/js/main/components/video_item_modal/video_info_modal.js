"use strict";
const React = require('react');
const VideoFileDetail = require('./video_file_detail.js');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Tabs = require('react-simpletabs');
var api = require('../../../common/api.js');

let episodeSort = function(a, b) {
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
      }

let VideoInfoModal = React.createClass({

  getInitialState: function() {
    return {
      currentFile: null
    };
  },

  playFile: function(index) {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + index;
  },

  setFileInfo: function(index, fileinfo) {
    fileinfo.id = this.props.id;
    fileinfo.index = index;
    this.setState({currentFile: fileinfo});
  },

  componentDidMount: function() {
    let fileinfo = this.props.filedata[0];
    fileinfo.id = this.props.id;
    fileinfo.index = 0;
    this.setState({currentFile: fileinfo});
  },

  // TODO: Clean this render function up
  render: function() {
    let contentStyle = {
      padding:'15px'

    };
    let rowStyle = {
      padding: '0px 0px 20px 0px',
    };
    let columnStyle = {
      height: '24px',
      overflow: 'none'
    };
    let textBottom = {
      position: 'absolute',
      bottom: '0'
    }
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    let filesArray = this.props.filedata;
    console.log(this.props);
    if (filesArray[0].episode) {
      filesArray.sort(episodeSort);
    }
    console.log(this.props);

    let nodes = filesArray.map(function(filedata, index) {

      let title = filedata.episode && filedata.episode.name ? filedata.episode.name : filedata.filename;
      let playbutton;

      if (!filedata.episode) {
        playbutton = (
          <Col md={1} style={columnStyle}>
          <button className="btn btn-default btn-sm" onClick={this.playFile.bind(this, index)}>
            <span  className="glyphicon glyphicon-play"></span>
          </button>
          </Col>);
      }
      return (
        <Row  key={index} style={rowStyle}>
          {playbutton}
          <Col onClick={this.setFileInfo.bind(this, index, filedata)} md={10} style={columnStyle} >
            <div>{title}</div>
          </Col>
        </Row>
      );
    }.bind(this));

    const leftStyle = { overflowY: 'auto'};
    const rightStyle = { overflowY: 'none'};
    const posterStyle = {
      borderStyle: 'solid',
      borderWidth: '5px'
    };
    if (this.props.media_type === 'movie') {
      return(
        <Tabs>
          <Tabs.Panel title='Details'>
            <div id="movie-details-panel" style={contentStyle}>
              <Row>
                <Col md={4}>
                  <img src={api.BaseUrl + this.props.poster_path} width="100%" style={posterStyle}/>
                </ Col>
                <Col md={8}>
                  <Row>
                    <p>{this.props.long_plot}</p>
                  </Row>
                  <Row>
                    <b><h6>Starring:</h6></b> <h5>{this.props.actors}</h5>
                  </Row>
                  <Row>
                    <b><h6>Directed by:</h6></b> <h5>{this.props.director}</h5>
                  </Row>
                  <Row>
                    <b><h6>Written by:</h6></b> <h5>{this.props.writer}</h5>
                  </Row>
                  <Row>
                    <b><h6>Budget:</h6></b> <h5>{formatter.format(this.props.budget)}</h5>
                  </Row>
                  <Row>
                    <b><h6>Genres:</h6></b> <h5>{this.props.genres.map(genre => genre.name).join(', ')}</h5>
                  </Row>
                </Col>
              </Row>
            </div>
          </Tabs.Panel>
          <Tabs.Panel title='Files'>
            <div>
              <Col md={9}>
                <div style={contentStyle}>{nodes}</div>
              </Col>
            </div>
          </Tabs.Panel>
          <Tabs.Panel title='Editor'>
          </Tabs.Panel>
      </Tabs>
      )
    } else {
     return(
      <div>
        <Col md={4} style={leftStyle}>
          <div style={contentStyle}>{nodes}</div>
        </Col>
        <Col md={8} style={rightStyle}>
          <VideoFileDetail file={this.state.currentFile} />
        </Col>
      </div>
    );
    }
  }
});

module.exports = VideoInfoModal;