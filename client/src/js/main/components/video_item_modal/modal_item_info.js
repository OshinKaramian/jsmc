"use strict";
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;

let ModalItemInfo = React.createClass({
  render: function() {
    let titleClass = this.props.className + "-title";
    let contentClass = this.props.className + "-content";
    return (
      <Row className={this.props.className}>
        <Col md={1} className={titleClass}><h4>{this.props.title}</h4></Col>
        <Col md={1}/>
        <Col md={10} className={contentClass}><h5>{this.props.content}</h5></Col>
      </Row>
    );
  }
});

module.exports = ModalItemInfo;