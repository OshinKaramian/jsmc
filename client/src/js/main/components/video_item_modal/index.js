"use strict";
const $ = require('jquery');
const jquery = require('jquery');
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Modal = require('react-modal');
let ModalItemInfo = require('./modal_item_info.js');
let VideoOptionBar = require('./video_option_bar.js');
let VideoInfoModal = require('./details/');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentMovie: null,
      isModalOpen: false,
      currentPanel: this.generalInfoContent
    };
  },

  closeModal: function() {
    this.setState({ isModalOpen: false });
  },

  openInfoPanel: function() {
    this.setState({ isModalOpen: true });
  },

  generalInfoContent: function() {
    let modalStyle = {
      overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(255, 255, 255, 0.75)'
      },
      content : {
        position                   : 'absolute',
        top                        : '40px',
        left                       : '15%',
        right                      : '15%',
        bottom                     : '40px',
        border                     : '1px solid #ccc',
        background                 : '#fff',
        overflow                   : 'hidden',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '0px',
        paddingLeft: '5px',
        paddingRight: '5px'

      }
    };

    let modalTitleStyle = {
      margin: '5px'
    }
    console.log(this.props);

    return (
      <Row >
        <Col className="modal-video-info" lg={4} md={6} sm={12} xs={12}>
          <Row className="modal-movie-title"><h1>{this.props.title}</h1></Row>
          <Col md={12}>
            <VideoOptionBar openInfo={this.openInfoPanel} videoId={this.props.id} />
            <ModalItemInfo className="modal-grid-row-right" title="Plot:" content={this.props.short_plot || this.props.long_plot} />
          </Col>
        </Col>
        <Modal isOpen={this.state.isModalOpen} onRequestClose={this.closeModal} style={modalStyle} contentLabel={"Modal"}>
          <Row className="modal-movie-title" style={modalTitleStyle}><h1>File Details</h1></Row>
          <VideoInfoModal { ...this.props}/>
        </Modal>
      </Row>
    );
  },

  render: function() {
    if (this.props.isModalOpen) {
      return (
          <Grid className="movie-info-content" fluid={true}>
            {this.state.currentPanel()}
          </Grid>
      );
    } else {
      return (null);
    }
  }
});