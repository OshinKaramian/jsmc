"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
 
module.exports.construct = function() {
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
};

module.exports.deconstruct = function() {
  try {
    $('.carousel').slick('unslick');
  } catch (ex) {
    console.log(ex);
  }
};

module.exports.findByIndex = function(index) {
  return $('div[data-slick-index="' + index + '"').children().first()
};