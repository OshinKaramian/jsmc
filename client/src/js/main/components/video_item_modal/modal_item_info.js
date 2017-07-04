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
      WebkitLineClamp: '3',
      WebkitBoxOrient: 'vertical',
      display: '-webkit-box',
      overflow:'hidden',
      bottom: '0',
      paddingTop:'3px',
      fontFamily: 'coolveticaregular',
      fontSize: '15px'
    }
    return (
      <Row className={this.props.className}>
        <Col md={1} className={titleClass} style={inlinetitle}><h4>{this.props.title}</h4></Col>
        <Col md={1}/>
        <Col md={10} className={contentClass} ><h5 style={inlineContent}>{this.props.content}</h5></Col>
      </Row>
    );
  }
});

module.exports = ModalItemInfo;