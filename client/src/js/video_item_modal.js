"use strict";
var $ = require('jquery');
window.$ = window.jQuery = require('jquery')
var jquery = require('jquery');
var React = require('react');
var Modal = require('react-modal');
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;

class ModalItemInfo extends React.Component {
  render() {
    var titleClass = this.props.className + "-title";
    return (
      <Row className={this.props.className}>
        <Col md={1} sm={3} className={titleClass}><h6>{this.props.title}</h6></Col>
        <Col md={11} sm={9}><h4><small>{this.props.content}</small></h4></Col>
      </Row>
    );
  }
}

class VideoOptionBar extends React.Component {
  playVideo() {
    window.location = 'video.html?filename=' + this.props.videoId;
  }

  openInfo() {
    this.props.openInfo();
  }

  render() {
    return (
      <Row className="video-option-bar">
        <Col md={10} sm={4} />
        <Col md={1}  sm={4}><span onClick={this.openInfo.bind(this)} className="glyphicon glyphicon-info-sign" /></Col>
        <Col md={1}  sm={4}><span onClick={this.playVideo.bind(this)} className="glyphicon glyphicon-play" /></Col>
      </Row>
    );
  }
}

// This is huge, chop it down
class VideoItemModal extends React.Component {
  constructor() {
    super();
    this.state = {
      currentMovie: null,
      isModalOpen: false,
      currentPanel: this.generalInfoContent.bind(this)
    };
  }

  closeModal() {
    $("body").removeClass("modal-open");
    this.props.onRequestClose();
    this.setState({ currentPanel: this.generalInfoContent.bind(this) });
  }

  openInfoPanel() {
    this.setState({ currentPanel: this.fileInfoContent.bind(this) });
  }

  generalInfoContent() {
    return (
      <Row>
        <Col md={6} sm={12} className="movie-info-backdrop-column">
          <Row>
            <Col md={12}>
              <img className="backdrop-img" src={this.props.backdrop_path} />
            </Col>
          </Row>
          <VideoOptionBar openInfo={this.openInfoPanel} videoId={this.props.id} />
        </Col>
        <Col md={6} sm={12}>
          <ModalItemInfo className="modal-grid-row-right-top" title="Plot:" content={this.props.long_plot} />
          <ModalItemInfo className="modal-grid-row-right" title="Director:" content={this.props.director} />
          <ModalItemInfo className="modal-grid-row-right" title="Writer:" content={this.props.writer} />
          <ModalItemInfo className="modal-grid-row-right" title="Actors:" content={this.props.actors} />
        </Col>
      </Row>
    );
  }

  playFile(fileInfo, index) {
    window.location = 'video.html?filename=' + this.props.id + '&fileId=' + index;
  }

  fileInfoContent() {
    var files = this.props.filedata.map(function(file, index) {
      return (
        <Row>
          <Col md={1} className="video-option-bar" onClick={self.playFile.bind(this, file, index)}><center><span className="glyphicon glyphicon-play" /></center></Col>
          <Col md={11}>{file.filename}</Col>
        </Row>
      );
    }.bind(this));

    return (
      <Row>
        <Col md={12}>
          {files}
        </Col>
      </Row>
    );
  }

  render() {
     var modalStyle = {
        content: {
          padding: "0px",
          left:"0px",
          right: "0px",
          borderRadius: "0px",
          top:"auto",
          bottom: "auto"
        }
      };

    if (this.props.isModalOpen) {
      $("body").addClass("modal-open");
      return (
        <Modal className="modal-info-body" onRequestClose={this.closeModal.bind(this)} style={ modalStyle } isOpen={this.props.isModalOpen} >
          <Grid className="movie-info-content" fluid={true}>
            <Row className="movie-info-header" >
              <Col className="movie-info-header-title" md={12}>
                <h2>{this.props.title}</h2>
              </Col>
            </Row>
            {this.state.currentPanel()}
          </Grid>
        </Modal>
      );
    } else {
      return null;
    }
  }
};

module.exports = VideoItemModal;
