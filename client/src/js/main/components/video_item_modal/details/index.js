"use strict";
const React = require('react');
const { Row, Col } = require('react-bootstrap');
const Tabs = require('react-simpletabs-alt');
const { VideoBasicDetailsRow } = require('./common.js');
const TelevisionDetails = require('./television.js');
const MovieDetails = require('./movie.js');
var api = require('../../../../common/api.js');

const VideoBasicDetails = (props) => {
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
        <img src={api.BaseUrl + props.poster_path} width="100%" style={posterStyle}/>
      </ Col>
      <Col md={8}>
        <Row>
          <p>{props.long_plot}</p>
        </Row>
        <VideoBasicDetailsRow label="Rating" value={props.rated} />
        <VideoBasicDetailsRow label="Starring" value = {props.actors} />
        <VideoBasicDetailsRow label="Directed by" value={props.director} />
        <VideoBasicDetailsRow label="Written by" value={props.writer} />
        <VideoBasicDetailsRow label="Budget" value={formatter.format(props.budget)} />
        <VideoBasicDetailsRow label="Genres" value={props.genres ? props.genres.map(genre => genre.name).join(', ') : ''} />
        <VideoBasicDetailsRow label="Awards" value={props.awards ? props.awards.map(award => award.category).join(', ') : ''} />
        <VideoBasicDetailsRow label="IMDB Rating" value={props.imdb_rating} />
      </Col>
    </Row>
  );
},


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
        <Tabs.Panel title={ this.props.category === 'tv' ? 'Episodes': 'Files'}>
          <div style={contentStyle}>
            { this.props.category === 'movie'? <MovieDetails id={this.props.id} files={filesArray} /> : null } 
            { this.props.category === 'tv'? <TelevisionDetails id={this.props.id} files={filesArray} /> : null } 
          </div>
        </Tabs.Panel>
        <Tabs.Panel title='Editor'>
          <div>
            Placeholder
          </div>
        </Tabs.Panel>
      </Tabs>
    )
  }
});

module.exports = VideoInfoModal;