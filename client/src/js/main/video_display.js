"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery');
var React = require('react');
var Slick = require('slick-carousel');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var VideoItemModal = require('./video_item_modal.js');
var api = require('../common/api.js');

var VideoDisplay = React.createClass({
  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false
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
  
  componentDidUpdate: function() {
      $('.carousel').slick({    
        infinite: false,
        dots: false,
        speed: 500,
        slidesToShow: 9,
        slidesToScroll: 8,
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
   let itemStyle = { 
      'background': "url(" + this.props.movie.backdrop_path + ")", 
      '-webkit-background-size': 'cover',
    };
    $('body').css(itemStyle);
    this.props.onItemClick(this.props.movie);
  },

  render: function() {
    let divStyle = {
      display: 'inline-block'
    };
          
    return (     
      <div onClick={this.handleClick}>
        <img height="100%" src={this.props.poster} data-fileid={this.props.movie.id}/>
      </div>
    )
  } 
});

module.exports = VideoDisplay;