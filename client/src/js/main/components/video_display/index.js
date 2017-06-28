"use strict";
var $ = require('jquery');
var React = require('react');
var Slick = require('slick-carousel');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var VideoItemModal = require('../video_item_modal');
const slider = require('../slider');
var api = require('../../../common/api.js');

var VideoDisplay = React.createClass({
  slickSet: false,
  
  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false,  
    };
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
  
  setControlEventListeners: function() {
    if (!this.slickSet) {
      this.slickSet = true;
      document.addEventListener('keydown', function(event) {
        if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement) {
          let totalSlides = $('.carousel').slick('getOption', 'slidesToShow');
          // left
          if (event.keyCode === 37) {
            document.querySelectorAll('.slider-button-left')[0].click();
          //right
          } else if (event.keyCode === 39) {
            document.querySelectorAll('.slider-button-right')[0].click();       
          // A number
          } else if (event.keyCode >= 49 && event.keyCode < (49 + totalSlides)) {
            let index = event.keyCode - 49;
            document.querySelectorAll('.slick-active')[index].click();
          }
        }
      });
    }
  },
  
  componentDidUpdate: function() {
    if (document.querySelectorAll('.slick-active').length === 0 && this.props.movies) {
      slider.construct();
      this.setControlEventListeners(); 
    }
  },

  render: function() {
    let movies = this.props.movies || [];
    let nodes = movies.map(function(movie, index) {
      return <VideoItem onItemClick={this.onChildClick} key={index} movie={movie} poster={movie.poster_path} title={movie.title} videoid={movie.id}></VideoItem>
    }.bind(this));
    
    let currentMovie = this.state.currentMovie || {};
    let rowStyle = { height: "500px", top:"0px"};
      
    return (
        <div>    
          <Row style={rowStyle}>
            <Col md={12}>
              <div >
                <VideoItemModal {... currentMovie} isModalOpen={this.state.isModalOpen} onRequestClose={this.onRequestClose} />
              </div>
            </Col>
          </Row>
          <center>
          <Row className="footer">
            <Col md={1}>
            <div>
                <h1><i className="slider-button slider-button-left fa fa-chevron-circle-left fa-8x"></i></h1>
            </div>
            </Col>
            <Col md={10}>
            <div className="carousel">
                {nodes}
            </div>
            </Col>
            <Col md={1}>
                <div>
                    <h1><i className="slider-button slider-button-right fa fa-chevron-circle-right fa-8x"></i></h1>
                </div>
            </Col>
          </Row>
          </center>
        </div>
      );
  }
});

let VideoItem = React.createClass({
  handleClick: function(event) {
    let newBackground = new Image();
    let backdropImage;
    
    if (this.props.movie.backdrop_path) {
      backdropImage = this.props.movie.backdrop_path;
    } else {
      backdropImage = 'staticassets/blank.jpg';
    }
    
    newBackground.onload = function() { 
      
      let itemStyle = { 
        'background-image': "url(" + api.BaseUrl + backdropImage + ")", 
        '-webkit-backface-visibility': 'hidden',
        '-webkit-transition': 'background 2s ease-in-out',
        '-moz-transition': 'background 2s ease-in-out',
        '-o-transition': 'background 2s ease-in-out',
        'transition': 'background 2s ease-in-out',
        '-webkit-transform-style': 'preserve-3d',
        '-webkit-transform': 'translate3d(0,0,0)',
        '-webkit-background-size': 'cover',
        '-moz-background-size': 'cover',
        '-o-background-size': 'cover',
        'background-size': 'cover'
      };
    
      $(".container-background-front").css(itemStyle);
      $(".slick-current-selection").removeClass("slick-current-selection");
      $('[data-fileid="' + this.props.movie.id +'"]').addClass('slick-current-selection');
      this.props.onItemClick(this.props.movie);
   }.bind(this);
   
   newBackground.src = api.BaseUrl + backdropImage;
  },

  render: function() {
    let divStyle = { 'display': 'inline-block' };   
    let divHidden = { 'display': 'none' };
    let posterImage;
    
    if (this.props.movie.poster_path) {
      posterImage = this.props.movie.poster_path;
    } else {
      posterImage = 'staticassets/blank.jpg';
    }
    return (     
      <div onClick={this.handleClick} className="video-item">
        <img height="100%" data-lazy={api.BaseUrl + posterImage} data-fileid={this.props.movie.id}/>
      </div>
    )
  } 
});

module.exports = VideoDisplay;