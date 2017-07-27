"use strict";
const $ = require('jquery');
const jquery = require('jquery');
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Modal = require('react-modal');
const api = require('../../../common/api.js');

const GenresPanel = React.createClass({
  getInitialState: function() {
    return {
      data: ['']
    };
  },

  componentDidMount: function() {
    console.log('mounted');
    api.collection.genres('Movies')
      .then(response => {
        this.setState({
          data: response.items
        });
      });
  },

  updateMedia: function(genre) {
    console.log(genre);
    api.collection.getByGenre('Movies', genre)
      .then(response => {
        console.log(response.items);
        this.props.updateParentState(response.items);
      });
  },

  render: function() {

    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '20px'
    };

    const { data = [''] } = this.state;
    const genres = data.map(genre => <Row key={genre}><h2 style={itemStyle} onClick={this.updateMedia.bind(this, genre)}>{genre}</h2></Row>);
    return (<div>{genres}</div>);
  }
});

const CollectionsPanel = React.createClass({
  getInitialState: function() {
    return {
      data: ['']
    };
  },

  componentDidMount: function() {
    api.config.get()
      .then(response => {
        this.setState({
          data: response
        });
      });
  },

  updateMedia: function(collection) {
    api.collection.get(collection)
      .then(response => {
        this.props.updateParentState(response);
      });
  },

  render: function() {
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '20px'
    };

    const { data = [''] } = this.state;
    const collections =
      Object.keys(data).map(genre =>
        <Row key={genre}><h2 style={itemStyle} onClick={this.updateMedia.bind(this, genre)}>{genre}</h2></Row>);
    return (<div>{collections}</div>);
  }

});

const RecentlyAddedPanel = React.createClass({
  getInitialState: function() {
    return {
      data: ['']
    };
  },

 componentDidMount: function() {
   this.updateMedia('Movies');

 },

  updateMedia: function(collection) {
    api.collection.get(collection)
      .then(response => {
        response = response.sort((a,b) => {
          const aFiles = a.filedata;
          const bFiles = b.filedata;
          const aCreate = aFiles[aFiles.length - 1].create_time;
          const bCreate = bFiles[bFiles.length - 1].create_time;

          if (aCreate > bCreate) {
            return 1;
          }

          if (bCreate > aCreate) {
            return -1;
          }

          return 0;
        });
        this.props.updateParentState(response);
      });
  },

  render: function() {
    return (null);
  }
});


module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentActive: null
    };
  },

  setActive: function(activePanel) {
    this.setState({
      currentActive: activePanel
    });
  },


  render: function() {
    const style = {
      background: 'linear-gradient(to bottom right, #b3b3b3, white)',
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '50px',
      left: '0px'
    };

    const midPanelStyle = {
      backgroundColor: 'black',
      height: '100%'
    }
    const leftPanelStyle = {
      backgroundColor:'maroon',
      height: '100%'
    }
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '0px'
    };
    return (
      <div style={style}>
        <Col md={3} style={leftPanelStyle} >
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'collections')}>
            <h1>Collections</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'genres')}>
            <h1>Genres</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'recent')}>
            <h1>Recently Added</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'awards')}>
            <h1>Award Winners</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'directors')}>
            <h1>Directors</h1>
          </Row>
        </Col>
        <Col md={3} style={midPanelStyle}>
          {
            !this.state.currentActive || this.state.currentActive === 'collections' ?
              <CollectionsPanel updateParentState={this.props.updateParentState}/> : null
          }
          {
            this.state.currentActive === 'genres' ?
              <GenresPanel updateParentState={this.props.updateParentState}/> : null
          }

          {
            this.state.currentActive === 'recent' ?
              <RecentlyAddedPanel updateParentState={this.props.updateParentState}/> : null
          }
        </Col>

      </div>
    );
  },
});