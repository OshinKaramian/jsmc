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
    api.collection.genres('Movies')
      .then(response => {
        this.setState({
          data: response.items
        });
      });
  },

  updateMedia: function(genre) {
    api.collection.getByGenre('Movies', genre)
      .then(response => {
        this.props.updateParentState(response.items);
      });
  },

  render: function() {
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '20px',
      cursor: 'pointer'
    };

    const { data = [''] } = this.state;
    const genres = data.map(genre => <Row key={genre}><h2 style={itemStyle} onClick={this.updateMedia.bind(this, genre)}>{genre}</h2></Row>);
    return (<div>{genres}</div>);
  }
});

const DirectorsPanel = React.createClass({
  getInitialState: function() {
    return {
      data: ['']
    };
  },

  componentDidMount: function() {
    api.collection.get('Movies')
      .then(response => {
        const directors = response.reduce((array, currentMedia) => {
          const { director } = currentMedia;
          if (director && !array[director]) {
            array[director] = 1;
          } else if (array[director]) {
            array[director]++;
          }

          return array;
        },[])
        const mappedDirector = Object.keys(directors).map(name => {
          return {
            name,
            value: directors[name] 
          }
        });

        mappedDirector.sort((a,b) => {
          if (a.value > b.value) {
            return -1;
          }

          if (b.value > a.value) {
            return 1;
          }

          return 0;
        });

        this.setState({
          data: mappedDirector 
        });
      });
  },

  updateMedia: function(director) {
    api.collection.get('Movies')
      .then(response => {
        console.log(response);
        console.log(director);
        const directorMovies = response.filter(movie => {
          return movie.director === director;
        });

        console.log(directorMovies);
        this.props.updateParentState(directorMovies);
      });
  },

  render: function() {
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '20px',
      cursor: 'pointer'
    };

    const { data = [''] } = this.state;
    const directors = data.map(((director, index) => <Row key={index}><h2 style={itemStyle} onClick={this.updateMedia.bind(this, director.name)}>{director.name}</h2></Row>));
    return (<div>{directors}</div>);
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
      marginLeft: '20px',
      cursor: 'pointer'
    };

    const { data = [''] } = this.state;
    const collections =
      Object.keys(data).map(genre =>
        <Row key={genre}><h2 style={itemStyle} onClick={this.updateMedia.bind(this, genre)}>{genre}</h2></Row>);
    return (<div>{collections}</div>);
  }

});

const SortPanel = React.createClass({
  getInitialState: function() {
    return {
      data: ['']
    };
  },

  componentDidMount: function() {
   this.updateMedia('Movies');
  },

  sortByRecentMedia: function(collection) {
    api.collection.get(collection)
      .then(response => {
        response = response.sort((a,b) => {
          const aFiles = a.filedata;
          const bFiles = b.filedata;
          const aCreate = aFiles[aFiles.length - 1].create_time;
          const bCreate = bFiles[bFiles.length - 1].create_time;

          if (aCreate > bCreate) {
            return -1;
          }

          if (bCreate > aCreate) {
            return 1;
          }

          return 0;
        });
        this.props.updateParentState(response);
      });
  },

  sortByTitle: function(collection) {
    api.collection.get(collection)
      .then(response => {
        console.log(response);
        response = response.sort((a,b) => {
          const aTitle = a.title;
          const bTitle = b.title;

          if (aTitle < bTitle) {
            return -1;
          }

          if (bTitle < aTitle) {
            return 1;
          }

          return 0;
        });
        this.props.updateParentState(response);
      });

  },

  render: function() {
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '20px',
      cursor: 'pointer'
    };

    return (
      <div>
        <Row key='title'><h2 style={itemStyle} onClick={this.sortByTitle.bind(this, 'Movies')}>Title</h2></Row>
        <Row key='recently_added'><h2 style={itemStyle} onClick={this.sortByRecentMedia.bind(this, 'Movies')}>Recently Added</h2></Row>
      </div>
    );
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
      width: '50%',
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
      marginLeft: '0px',
      cursor: 'pointer'
    };
    return (
      <div style={style}>
        <Col md={6} style={leftPanelStyle} >
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'genres')}>
            <h1>Genres</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'sort')}>
            <h1>Sort By</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'awards')}>
            <h1>Award Winners</h1>
          </Row>
          <Row style={itemStyle} onClick={this.setActive.bind(this, 'directors')}>
            <h1>Directors</h1>
          </Row>
        </Col>
        <Col md={6} style={midPanelStyle}>
          {
            this.state.currentActive === 'collections' ?
              <CollectionsPanel updateParentState={this.props.updateParentState}/> : null
          }
          {
            !this.state.currentActive || this.state.currentActive === 'genres' ?
              <GenresPanel updateParentState={this.props.updateParentState}/> : null
          }

          {
            this.state.currentActive === 'sort' ?
              <SortPanel updateParentState={this.props.updateParentState}/> : null
          }

          {
            this.state.currentActive === 'directors' ?
              <DirectorsPanel updateParentState={this.props.updateParentState}/> : null
          }
        </Col>

      </div>
    );
  },
});