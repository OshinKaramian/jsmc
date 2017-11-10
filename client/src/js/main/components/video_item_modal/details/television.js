"use strict";
const React = require('react');
const { Row, Col } = require('react-bootstrap');
const Tabs = require('react-simpletabs-alt');
const { VideoBasicDetailsRow } = require('./common.js');
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
};

const EpisodeName = React.createClass({
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
        <Col md={10} style={columnStyle} >
          {this.props.episode.name}
        </Col>
      </Row>
    )
  }
});

const VideoFileDetailsRowTV = React.createClass({
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
        <Col md={10} style={columnStyle} >
          <Row>
            <img width='100%' src={this.props.episode.image} />
          </Row>
          <Row>
            <button className="btn btn-default btn-sm" onClick={this.playFile}>
              <span  className="glyphicon glyphicon-play"></span>
            </button>
          </Row>
          <VideoBasicDetailsRow label='Episode Number' value={this.props.episode.episode_number} />
          <VideoBasicDetailsRow label='Name' value={this.props.episode.name} />
          <VideoBasicDetailsRow label='Summary' value={this.props.episode.overview} />
        </Col>
      </Row>
    )
  }
});

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentFileIndex: 0
    };
  },

  setCurrentEpisode: function(episodeIndex) {
    this.setState({currentFileIndex: episodeIndex});
  },

  render: function() {
    const flattenFiles = this.props.files.map((filedata, index) => {
      if (filedata.metadata) {
        filedata.episode = filedata.metadata.episode;
        filedata.episode.index = index;
        delete filedata.metadata;
      }
      return filedata;
    });

    flattenFiles.sort(episodeSort);

    const seasons = flattenFiles.reduce((seasonsArray, current) => {
      if (!seasonsArray[`${current.episode.season_number}`]) {
        seasonsArray[`${current.episode.season_number}`] = [];
      }

      seasonsArray[`${current.episode.season_number}`].push(current);
      return seasonsArray;
    }, []);

    const realSeasonArray = seasons.filter(season => season.length > 0);
    const nodes = realSeasonArray.map((season, index) => {
      const contentStyle = {
        padding:'25px'
      };
      const panelTitle = `Season ${season[0].episode.season_number}`;
      const episodes = season.map((file, index) => {
        return (<div key={index} onClick={this.setCurrentEpisode.bind(this, index)}><EpisodeName key={index} episode={file.episode} index={index} /></div>);
      });

      const fileNodes = season.map((file, index) => {
        return (<VideoFileDetailsRowTV  key={index} id={this.props.id} episode={file.episode} index={file.episode.index} filename={file.filename}/>);
      });

      return ( <Tabs.Panel key={index} title={panelTitle} >
        <div id="movie-details-panel" style={contentStyle}>
        <Col md={2} >
          {episodes}
        </Col>
        <Col md={10} >
          { fileNodes[this.state.currentFileIndex] }
        </Col>
        </div>
      </Tabs.Panel>)
    });

    return (<Tabs onBeforeChange={this.setCurrentEpisode.bind(this, 0)}>{nodes}</Tabs>);
  }
});