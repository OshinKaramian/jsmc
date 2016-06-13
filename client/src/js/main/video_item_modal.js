"use strict";
const $ = require('jquery');
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
  
  setEventListeners() {        
      /*document.addEventListener('keydown', function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);
        if (keyPressed === 'P') {
          this.playVideo();
        }
      }.bind(this)); 
      */
  }
  
  playVideo() {
    window.location = 'video.html?mediaId=' + this.props.videoId;
  }

  openInfo() {
    this.props.openInfo();
  }
  
  componentDidMount() {
    this.setEventListeners();
  }

  render() {
    return (
      <Row className="video-option-bar">
        <Col md={12}><button className="btn btn-default btn-lg btn=movie-play" onClick={this.openInfo.bind(this)}><span className="glyphicon glyphicon-info-sign"></span></button>
        <button className="btn btn-default btn-lg" onClick={this.playVideo.bind(this)}><span  className="glyphicon glyphicon-play"></span></button></Col>
      </Row>
    );
  }
}

class VideoInfoModal extends React.Component {
  constructor() {
    super();
    this.state = {
      currentFile: null,  
    };
  }
  
  playFile(index) {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + index;
  }
  
  setFileInfo(index, fileinfo) {
    fileinfo.id = this.props.id;
    fileinfo.index = index;
    this.setState({currentFile: fileinfo});
  }
  
  componentDidMount() {
    let fileinfo = this.props.filedata[0];
    fileinfo.id = this.props.id;
    fileinfo.index = 0;
    this.setState({currentFile: fileinfo});
  }
  
  render() {
    let contentStyle = {
      padding:'15px'
     
    };
    let rowStyle = {
      padding: '0px 0px 20px 0px',
    };
    let columnStyle = {
      height: '24px',
      overflow: 'none'
    };
    let textBottom = {
      position: 'absolute',
      bottom: '0'
    }
    
    let filesArray = this.props.filedata;
    console.log(this.props);
    if (filesArray[0].episode) {
      filesArray.sort(function(a, b) {
        if (!a.episode || !b.episode) {
          return -1
        }
        
         if (a.episode.season_number > b.episode.season_number) {
          return 1;
        }
        
        if (a.episode.season_number < b.episode.season_number) {
          return -1;
        }
        
        if (a.episode.episode_number > b.episode.episode_number) {
          return 1;
        }
        
        if (a.episode.episode_number < b.episode.episode_number) {
          return -1;
        }

        // a must be equal to b
        return 0;
      });
    }
    let nodes = filesArray.map(function(filedata, index) {
      
      let title = filedata.episode && filedata.episode.name ? filedata.episode.name : filedata.filename;
      let playbutton;
      
      if (!filedata.episode) {
        playbutton = (
          <Col md={1} style={columnStyle}>
          <button className="btn btn-default btn-sm" onClick={this.playFile.bind(this, index)}>
            <span  className="glyphicon glyphicon-play"></span>
          </button>
          </Col>);
      }
      return (
        <Row  key={index} style={rowStyle}>
          {playbutton}
          <Col onClick={this.setFileInfo.bind(this, index, filedata)} md={10} style={columnStyle} >
            <div>{title}</div>
          </Col>
        </Row>
      );
    }.bind(this));

    let leftStyle = { overflowY: 'auto'};
    let rightStyle = { overflowY: 'none'};
    if (this.props.media_type === 'movie') {
      return( <div>
        <Col md={9}>
          <div style={contentStyle}>{nodes}</div>
        </Col>
      </div>)
    } else {
     return( <div>
        <Col md={4} style={leftStyle}>
          <div style={contentStyle}>{nodes}</div>
        </Col>
        <Col md={8} style={rightStyle}>
          <VideoFileDetail file={this.state.currentFile} />
        </Col>
      </div>
    );
    }
  }
}

class VideoFileDetail extends React.Component {
  playFile() {
    window.location = 'video.html?mediaId=' + this.props.file.id + '&fileIndex=' + this.props.file.index;
  }
  
  render() {
    if (!this.props.file || !this.props.file.episode) {
      return <div></div>;
    }
    
    let rowStyle = { paddingBottom: '10px' };
    
    let backgroundImage = { 
      backgroundImage: 'url(' + this.props.file.episode.still_path + ')',
      minHeight : '55%',
      backgroundSize: 'cover',
      padding:'10px'
    };
    let playButton = {
      'color':'white'
    }
    console.log(this.props);
    
    return (
      <div>
        <Row style={rowStyle}>
          <Col md={12}>
            <div style={backgroundImage}>
              <i style={playButton} onClick={this.playFile.bind(this)} className="fa fa-play-circle fa-5x" aria-hidden="true"></i>
            </div>
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={1}>
            <b>Season: </b>
          </Col>
          <Col md={2}>
            {this.props.file.episode.season_number}
          </Col>
          <Col md={1}>
            <b>Episode: </b>
          </Col>
          <Col md={2}>
            {this.props.file.episode.episode_number}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={2}>
            <b>File: </b>
          </Col>
          <Col md={9}>
            {this.props.file.filename}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col md={2}>
            <b>Overview: </b>
          </Col>
          <Col md={9}>
            {this.props.file.episode.overview}
          </Col>
        </Row>
      </div>
    )
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
        overflow                   : 'none',
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
    
    return (
      <Row >      
        <Col className="modal-video-info" lg={4} md={6} sm={12} xs={12}>
          <Row className="modal-movie-title"><h1>{this.props.title}</h1></Row>
          <Col md={12}>        
          <VideoOptionBar openInfo={this.openInfoPanel.bind(this)} videoId={this.props.id} />   
            <ModalItemInfo className="modal-grid-row-right" title="Plot:" content={this.props.short_plot || this.props.long_plot} />
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