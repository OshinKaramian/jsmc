"use strict";
const $ = require('jquery');
const jquery = require('jquery');
const React = require('react');
const Modal = require('react-modal');
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const keyboard = require('../../../common/keyboard.js');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      isModalOpen: false,
    };
  },

  openModal: function() {
    this.setState({ isModalOpen: true });
  },

  closeModal: function() {
    this.setState({ isModalOpen: false });
  },

  toggleModal: function() {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  },

  componentDidMount: function() {
    keyboard.push(112, 'help', 'Open help modal', (event) => {
      this.toggleModal();
    });
  },

  render: function() {
    let modalStyle = {
      overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        margin: 'auto',
        backgroundColor   : 'rgba(255, 255, 255, 0.75)'
      },

      content : {
        position: 'absolute',
        top                   : '30%',
        left                  : '30%',
        right                 : '30%',
        bottom                : '30%',
        margin: 'auto',
        border                     : '1px solid #ccc',
        background                 : '#fff',
        overflow                   : 'hidden',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '0px'
      }
    };

    const contentStyle = { margin: '15px' };

    const nodes = keyboard.callRegister(['videodisplay', 'collections']).map((keyCall, index) => {
      return (
        <Row key={index}>
          <Col md={2}>{keyCall.value.toUpperCase()} :</Col>
          <Col md={8}>{keyCall.description}</Col>
        </Row>
      )
    });

    return (
      <Modal isOpen={this.state.isModalOpen} onRequestClose={this.closeModal} style={modalStyle} contentLabel={"Modal"}>
        <Row className="modal-movie-title" ><h1>Help!</h1></Row>
        <div style={contentStyle}>
          {nodes}
        </div>
      </Modal>
    );
  }
})