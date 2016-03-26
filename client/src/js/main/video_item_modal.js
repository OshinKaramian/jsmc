"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery')
const jquery = require('jquery');
const React = require('react');
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;
const Col = require('react-bootstrap').Col;
const Modal = require('react-modal');

class ModalItemInfo extends React.Component {
  render() {
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
}

class VideoOptionBar extends React.Component {
  playVideo() {
    window.location = 'video.html?mediaId=' + this.props.videoId;
  }

  openInfo() {
    this.props.openInfo();
  }

  render() {
    return (
      <Row className="video-option-bar">
        <Col md={12}><button className="btn btn-default btn-lg" onClick={this.openInfo.bind(this)}><span className="glyphicon glyphicon-info-sign"></span></button>
        <button className="btn btn-default btn-lg" onClick={this.playVideo.bind(this)}><span  className="glyphicon glyphicon-play"></span></button></Col>
      </Row>
    );
  }
}

class VideoInfoModal extends React.Component {
  playFile(index) {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + index;
  }
  
  render() {
    let contentStyle = {
      padding:'10px'
    };
    let rowStyle = {
      padding: '0px 0px 20px 0px'
    };
    let columnStyle = {
      height: '24px',
      overflow: 'none'
    };
    let textBottom = {
      position: 'absolute',
      bottom: '0'
    }

    let nodes = this.props.filedata.map(function(filedata, index) {
      return (
        <Row  key={index} style={rowStyle}>
          <Col md={1} style={columnStyle}>
            <button className="btn btn-default btn-sm" onClick={this.playFile.bind(this, index)}>
              <span  className="glyphicon glyphicon-play"></span>
            </button>
          </Col>
          <Col md={9} style={columnStyle}>
            <div >{filedata.filename}</div>
          </Col>
        </Row>
      );
    }.bind(this));
    return (<div style={contentStyle}>{nodes}</div>);
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
    this.setState({ isModalOpen: false });
  }

  openInfoPanel() {
    this.setState({ isModalOpen: true });
  }

  generalInfoContent() {
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
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '0px'

      }
    };
    
    let modalTitleStyle = {
      margin: '5px'
    }
    
    return (
      <Row >      
        <Col className="modal-video-info" lg={4} md={6} sm={12} xs={12}>
          <Row className="modal-movie-title"><h1>{this.props.title}</h1></Row>
          <Col md={12}>        
          <VideoOptionBar openInfo={this.openInfoPanel.bind(this)} videoId={this.props.id} />   
            <ModalItemInfo className="modal-grid-row-right" title="Plot:" content={this.props.short_plot} />
            <ModalItemInfo className="modal-grid-row-right" title="Director:" content={this.props.director} />
            <ModalItemInfo className="modal-grid-row-right" title="Writer:" content={this.props.writer} />
            <ModalItemInfo className="modal-grid-row-right" title="Actors:" content={this.props.actors} />            
          </Col>
        </Col>
        <Modal isOpen={this.state.isModalOpen} onRequestClose={this.closeModal.bind(this)} style={modalStyle}>
          <Row className="modal-movie-title" style={modalTitleStyle}><h1>File Details</h1></Row>    
          <VideoInfoModal { ...this.props}/>                          
        </Modal>
      </Row>
    );
  }

  playFile(fileInfo, index) {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + index;
  }

  fileInfoContent() {
    let files = this.props.filedata.map(function(file, index) {
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
     let modalStyle = {
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
      return (
          <Grid className="movie-info-content" fluid={true}>
            {this.state.currentPanel()}
          </Grid>
      );
    } else {
      return null;
    }
  }
};

module.exports = VideoItemModal;