"use strict";
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;

let ModalItemInfo = React.createClass({
  render: function() {
    let titleClass = this.props.className + "-title";
    let contentClass = this.props.className + "-content";
    let inlinetitle = {
      fontFamily: 'coolveticaregular',
      fontSize: '20px'
    }
    let inlineContent = {
      WebkitLineClamp: '5',
      WebkitBoxOrient: 'vertical',
      display: '-webkit-box',
      overflow:'hidden',
      bottom: '0px',
      paddingTop:'3px',
      fontFamily: 'coolveticaregular',
      fontSize: '15px'
    }
    return (
      <Row className={this.props.className}>
        <Col md={12} className={contentClass} ><h5 style={inlineContent}>{this.props.content}</h5></Col>
      </Row>
    );
  }
});

module.exports = ModalItemInfo;