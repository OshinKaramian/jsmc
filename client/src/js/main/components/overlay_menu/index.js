"use strict";
const $ = require('jquery');
const jquery = require('jquery');
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Modal = require('react-modal');

// This is huge, chop it down
module.exports = React.createClass({
  render: function() {
    const style = {
      background: 'linear-gradient(to bottom right, #b3b3b3, white)',
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '50px',
      left: '0px'
    };
    const leftPanelStyle = {
      backgroundColor:'maroon',
      height: '100%'
    }
    const itemStyle = {
      fontFamily: 'coolveticaregular',
      color: 'white',
      marginLeft: '0px'
    }
    return (
      <div style={style}>
        <Col md={3} style={leftPanelStyle}>
          <Row style={itemStyle}>
            <h1>Collections</h1>
          </Row>
          <Row style={itemStyle}>
            <h1>Genres</h1>
          </Row>
          <Row style={itemStyle}>
            <h1>Award Winners</h1>
          </Row>
          <Row style={itemStyle}>
            <h1>Directors</h1>
          </Row>
        </Col>
      </div>
    );
  },
});