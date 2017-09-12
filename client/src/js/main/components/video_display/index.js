"use strict";
const $ = require('jquery');
const React = require('react');
const Slick = require('slick-carousel');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const VideoItemModal = require('../video_item_modal');
const VideoItemSlider = require('./video_item_slider.js');
const slider = require('../slider');
const keyboard = require('../../../common/keyboard.js');
const api = require('../../../common/api.js');

module.exports = React.createClass({
  slickSet: false,

  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false,
    };
  },

  onItemClick: function(movie, event) {
    this.setState({
      isModalOpen: true,
      currentMovie: movie
    });
  },

  onRequestClose: function(event) {
    this.setState({ isModalOpen: "false" });
  },

  setControlEventListeners: function() {
    if (!this.slickSet) {
      this.slickSet = true;
      keyboard.push(37, 'Go forward one set of movies', function(event) {
        if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement) {
          // left
          document.querySelectorAll('.slider-button-left')[0].click();
        }
      });

      keyboard.push(39, 'Go backward one set of movies', function(event) {
        if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement) {
          //right
          document.querySelectorAll('.slider-button-right')[0].click();
        }
      });

      document.addEventListener('keydown', function(event) {
        if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement) {
          let totalSlides = $('.carousel').slick('getOption', 'slidesToShow');
          // A number
          if (event.keyCode >= 49 && event.keyCode < (49 + totalSlides)) {
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
    const { movies = [] } = this.props;
    const { currentMovie = {} } = this.state;
    const rowStyle = { height: "500px", top:"0px"};

    return (
        <div>
          <Row style={rowStyle}>
            <VideoItemSlider movies={movies} onItemClick={this.onItemClick} />
            <Col md={12}>
              <div >
                <VideoItemModal {... currentMovie} isModalOpen={this.state.isModalOpen} onRequestClose={this.onRequestClose} />
              </div>
            </Col>
          </Row>
        </div>
      );
  }
});