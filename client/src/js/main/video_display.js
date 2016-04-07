"use strict";
var $ = require('jquery');
var React = require('react');
var Slick = require('slick-carousel');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var VideoItemModal = require('./video_item_modal.js');
var api = require('../common/api.js');

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
    if (document.querySelectorAll('.slick-active').length === 0) {
      $('.carousel').slick({
        infinite: false,
        dots: false,
        speed: 500,
        slidesToShow: 9,
        slidesToScroll: 8,
        lazyLoad: 'ondemand',
        prevArrow: $('.slider-button-left'),
        nextArrow: $('.slider-button-right'),
        // the magic
        responsive: [{
            breakpoint: 1700,
            settings: {
                slidesToShow: 8,
                slidesToScroll: 7,
                infinite: true
            }

            },{

            breakpoint: 1450,
            settings: {
                slidesToShow: 7,
                slidesToScroll: 6,
                infinite: true
            }

            },{

            breakpoint: 1200,
            settings: {
                slidesToShow: 6,
                slidesToScroll: 5,
                infinite: true
            }

            },
            {

            breakpoint: 950,
            settings: {
                slidesToShow: 5,
                 slidesToScroll: 4,
                infinite: true
            }

            },
            {

            breakpoint: 700,
            settings: {
                slidesToShow: 4,
                 slidesToScroll: 3,
                infinite: true
            }

            },
            {

            breakpoint: 450,
            settings: {
                slidesToShow: 3,
                 slidesToScroll: 2,
                infinite: true
            }

            },
            {

            breakpoint: 200,
            settings: {
                slidesToShow: 2,
                 slidesToScroll: 2,
                infinite: true
            }

            }]
        });

        $('.carousel').on('afterChange', function(event, slick, currentSlide){
          document.querySelectorAll('.slick-current')[0].click();
        });

        this.setControlEventListeners();
      }
  },

  render: function() {
    let movies = this.props.movies || [];
    let nodes = this.props.movies.map(function(movie, index) {
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
    newBackground.src = api.BaseUrl + this.props.movie.backdrop_path;
    newBackground.onload = function() {
      let itemStyle = {
        'background-image': "url(" + api.BaseUrl + this.props.movie.backdrop_path + ")",
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

      //$('body').css(itemStyle);
      $('.container-background-front').css(itemStyle);
      $(".slick-current-selection").removeClass("slick-current-selection");
      $('[data-fileid="' + this.props.movie.id +'"]').addClass('slick-current-selection');
      this.props.onItemClick(this.props.movie);
    }.bind(this);
  },

  render: function() {
    let divStyle = {
      display: 'inline-block'
    };

    let divHidden = {
      'display': 'none'
    }

    return (
      <div onClick={this.handleClick}>
        <img height="100%" src={api.BaseUrl + this.props.poster} data-fileid={this.props.movie.id}/>
      </div>
    )
  }
});

module.exports = VideoDisplay;
