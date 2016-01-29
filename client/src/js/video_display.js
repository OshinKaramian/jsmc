var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var jquery = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Button= require('react-bootstrap').Button;
var Masonry = require('react-masonry-component')(React);
var Bootstrap = require('bootstrap');

var baseApiUrl = 'http://localhost:3000/';

var getCollection = function(collectionName) {
  return $.get(baseApiUrl + 'collections/' + collectionName);
};

var getConfig = function() {
  return $.get(baseApiUrl + 'config/');
}

var ModalItemInfo = React.createClass({
  render: function() {
    var titleClass = this.props.className + "-title";
    return (
      <Row className={this.props.className}>
        <Col md={1} sm={3} className={titleClass}><h6>{this.props.title}</h6></Col>
        <Col md={11} sm={9}><h4><small>{this.props.content}</small></h4></Col>
      </Row>
    );

  }
});

var VideoOptionBar = React.createClass({
  playVideo: function() {
    window.location = 'video.html?filename=' + this.props.videoId;
  },
  openInfo: function() {
    this.props.openInfo();
  },
  render: function() {
    return (
      <Row className="video-option-bar">
        <Col md={10} sm={4} />
        <Col md={1}  sm={4}><span onClick={this.openInfo} className="glyphicon glyphicon-info-sign" /></Col>
        <Col md={1}  sm={4}><span onClick={this.playVideo} className="glyphicon glyphicon-play" /></Col>
      </Row>
    );
  }
});

var VideoItemModal = React.createClass({
  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false,
      currentPanel: this.generalInfoContent
    };
  },

  closeModal: function() {
    $("body").removeClass("modal-open");
    this.props.onRequestClose();
    this.setState({ currentPanel: this.generalInfoContent });
  },

  openInfoPanel: function() {
    this.setState({ currentPanel: this.fileInfoContent });
  },

  generalInfoContent: function() {
    return (
      <Row>
        <Col md={6} sm={12} className="movie-info-backdrop-column">
          <Row>
            <Col md={12}>
              <img className="backdrop-img" src={this.props.backdrop_path} />
            </Col>
          </Row>
          <VideoOptionBar openInfo={this.openInfoPanel} videoId={this.props.id} />
        </Col>
        <Col md={6} sm={12}>
          <ModalItemInfo className="modal-grid-row-right-top" title="Plot:" content={this.props.long_plot} />
          <ModalItemInfo className="modal-grid-row-right" title="Director:" content={this.props.director} />
          <ModalItemInfo className="modal-grid-row-right" title="Writer:" content={this.props.writer} />
          <ModalItemInfo className="modal-grid-row-right" title="Actors:" content={this.props.actors} />
        </Col>
      </Row>
    );
  },

  playFile: function(fileInfo, index) {
    console.log(fileInfo);
    console.log(index);
    console.log(this.props);
    window.location = 'video.html?filename=' + this.props.id + '&fileId=' + index;
  },

  fileInfoContent: function() {
    var self = this;
    var files = this.props.filedata.map(function(file, index) {
      return (
        <Row>
          <Col md={1} className="video-option-bar" onClick={self.playFile.bind(this, file, index)}><center><span className="glyphicon glyphicon-play" /></center></Col>
          <Col md={11}>{file.filename}</Col>
        </Row>
      );
    }.bind(this));

    console.log(this.props.currentMovie);
    return (
      <Row>
        <Col md={12}>
          {files}
        </Col>
      </Row>
    );
  },

  render: function() {
     var modalStyle = {
        content: {
          padding: "0px",
          left:"0px",
          right: "0px",
          borderRadius: "0px",
          top:"auto",
          bottom: "auto"
        }
      };

    if (this.props.isModalOpen) {
      $("body").addClass("modal-open");
      return (
        <Modal className="modal-info-body" onRequestClose={this.closeModal} style={ modalStyle } isOpen={this.props.isModalOpen} >
          <Grid className="movie-info-content" fluid={true}>
            <Row className="movie-info-header" >
              <Col className="movie-info-header-title" md={12}>
                <h2>{this.props.title}</h2>
              </Col>
            </Row>
            {this.state.currentPanel()}
          </Grid>
        </Modal>
      );
    } else {
      return null;
    }
  }
});

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
    getCollection('Movies').then(function(data) {
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
    getConfig().then(function(data) {
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
