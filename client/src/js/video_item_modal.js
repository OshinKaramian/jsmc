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
    var contentClass = this.props.className + "-content";
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
    window.location = 'video.html?filename=' + this.props.videoId;
  }

  openInfo() {
    this.props.openInfo();
  }

  render() {
    return (
      <Row className="video-option-bar">
        <Col md={3}><button className="btn btn-default btn-lg" onClick={this.openInfo.bind(this)}><span className="glyphicon glyphicon-info-sign"></span> Info</button></Col>
        <Col md={3}><button className="btn btn-default btn-lg" onClick={this.playVideo.bind(this)}><span  className="glyphicon glyphicon-play"></span> Play</button></Col>
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
     
       /*<Col md={4} sm={12} className="movie-info-backdrop-column">
          <Row>
            <Col md={12}>
              <img className="backdrop-img" src={this.props.backdrop_path} />
            </Col>
          </Row>
          <VideoOptionBar openInfo={this.openInfoPanel} videoId={this.props.id} />
        </Col>*/
            /*     <h4>{this.props.movie.title}</h4>
              <h6>IMDB: <small>{this.props.movie.tomato_user_rating}</small></h6>
          <h6>Metacritc: <small>{this.props.movie.metacritic_rating}</small></h6>
          <h6>RT: <small>{this.props.movie.tomato_meter}/{this.props.movie.tomato_user_rating}</small></h6>
          */
        
        //document.body.style.background = "url(" + this.props.backdrop_path + ")";
         // document.body.style.-webkit-background-size = 'cover';
        //document.body.style.-moz-background-size = 'cover';
        //document.body.style.-o-background-size = 'cover';
        //document.body.style.background-size = 'cover';
    return (
      <Row >      
        <Col className="modal-video-info" md={4} sm={4} >
          <Row className="modal-movie-title"><h1>{this.props.title}</h1></Row>
          <Col md={12}>           
            <ModalItemInfo className="modal-grid-row-right" title="Plot:" content={this.props.long_plot} />
            <ModalItemInfo className="modal-grid-row-right" title="Director:" content={this.props.director} />
            <ModalItemInfo className="modal-grid-row-right" title="Writer:" content={this.props.writer} />
            <ModalItemInfo className="modal-grid-row-right" title="Actors:" content={this.props.actors} />
            <VideoOptionBar openInfo={this.openInfoPanel} videoId={this.props.id} />
          </Col>
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
