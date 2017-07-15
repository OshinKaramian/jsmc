var React = require('react');
//var Slick = require('slick-carousel');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var VideoItem = require('./video_item.js');

module.exports = (props) => {
    const videoItemMenuStyle = {
      marginLeft: '0px',
      marginRight: '0px'
    };
    let nodes = props.movies.map((movie, index) => {
      return <VideoItem onItemClick={props.onItemClick} key={index} movie={movie} poster={movie.poster_path} title={movie.title} videoid={movie.id}></VideoItem>
    });

    return (
      <center>
        <Row className="footer" style={videoItemMenuStyle}>
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
    );
  }