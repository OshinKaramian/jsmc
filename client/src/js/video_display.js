var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var React = require('react');
var ReactDOM = require('react-dom');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Bootstrap = require('bootstrap');
var VideoItemModal = require('./video_item_modal.js');
var api = require('./api.js');

var VideoDisplay = React.createClass({
  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false,
      data: []
    };
  },

  componentDidMount: function() {
    var self = this;
    api.getCollection('Movies').then(function(data) {
      self.setState({ data: data});
    }.bind(this));
  },

  onChildClick: function(movie, event) {
    this.setState({
      isModalOpen: true,
      currentMovie: movie
    });
  },

  onRequestClose: function(event) {
    this.setState({ isModalOpen: false });
  },

  render: function() {
    var
      self = this,
      movies = this.state.data || [],
      nodes = this.state.data.map(function(movie, index) {
        return <VideoItem onItemClick={self.onChildClick} key={index} movie={movie} poster={movie.poster_path} title={movie.title} videoid={movie.id}></VideoItem>
      }),
      currentMovie = this.state.currentMovie || {};

    return (
        <div>
          <VideoItemModal
            {... currentMovie}
            isModalOpen={this.state.isModalOpen}
            onRequestClose={this.onRequestClose}
          />
          <Row>
            {nodes}
          </Row>
        </div>
      );
  }
});

var VideoItem = React.createClass({
  handleClick: function(event) {
    console.log(this.props);
    this.props.onItemClick(this.props.movie);
  },

  render: function() {
    var self = this;
    return (
      <Col className="col-centered" lg={3} md={4} sm={4} xs={6} >
      <div >
        <div className="centered" onClick={this.handleClick} className="videoItem">
        <center>
          <img width="200px" src={this.props.poster}/>
          <h4>{this.props.movie.title}</h4>
          <h6>IMDB: <small>{this.props.movie.tomato_user_rating}</small></h6>
          <h6>Metacritc: <small>{this.props.movie.metacritic_rating}</small></h6>
          <h6>RT: <small>{this.props.movie.tomato_meter}/{this.props.movie.tomato_user_rating}</small></h6>
          </center>
        </div>
      </div>
      </Col>
    )
  }
});

var TopBanner = React.createClass({
  getInitialState: function() {
    return {
      config: {},
    };
  },

  componentDidMount: function() {
    var self = this;
    api.getConfig().then(function(data) {
      self.setState({ config: data});
    }.bind(this));
  },

  render: function() {
    console.log(this.state.config);
    var nodes = Object.keys(this.state.config).map(function(value) {
      return <Col md={2}><h4>{value}</h4></Col>
    });
    return (
        <Row className="top-banner">
          {nodes}
        </Row>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div className="container-full">
        <TopBanner />
        <VideoDisplay />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('content'));
