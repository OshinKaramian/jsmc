
"use strict";
const React = require('react');
const Row = require('react-bootstrap').Row;

module.exports.VideoBasicDetailsRow = React.createClass({
  render: function() {
    if (this.props.value) {
      return (
        <Row>
          <b><h6>{this.props.label}:</h6></b> <h5>{this.props.value}</h5>
        </Row>
      );
    } else {
      return (null);
    }
  }
});