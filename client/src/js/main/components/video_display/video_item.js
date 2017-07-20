const $ = require('jquery');
const React = require('react');
const api = require('../../../common/api.js');

module.exports = React.createClass({
  handleClick: function(event) {
    const newBackground = new Image();
    const { backdrop_path } = this.props.movie;
    const backdropImage = backdrop_path ? backdrop_path : 'staticassets/blank.jpg';

    newBackground.onload = () => {
      const { movie } = this.props;
      const itemStyle = {
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
      this.props.onItemClick(movie);
   };

   newBackground.src = api.BaseUrl + backdropImage;
  },
  
  render: function() {
    const { poster_path } = this.props.movie;
    const posterImage = poster_path ? poster_path : 'staticassets/blank.jpg';

    return (
      <div onClick={ this.handleClick } className="video-item">
        <img height="100%" data-lazy={ api.BaseUrl + posterImage } data-fileid={ this.props.movie.id }/>
      </div>
    )
  }
});