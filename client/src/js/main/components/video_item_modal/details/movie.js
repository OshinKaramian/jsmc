const React = require('react');
const { Row, Col } = require('react-bootstrap');

const VideoFileDetailsRow = React.createClass({
  playFile: function() {
    window.location = 'video.html?mediaId=' + this.props.id + '&fileIndex=' + this.props.index;
  },

  render: function() {
    const
      columnStyle = {
        height: '24px',
        overflow: 'none'
      },
      rowStyle = {
        padding: '0px 0px 20px 0px',
      };

    return (
      <Row  key={this.props.index} style={rowStyle}>
        <Col md={1} style={columnStyle}>
          <button className="btn btn-default btn-sm" onClick={this.playFile}>
            <span  className="glyphicon glyphicon-play"></span>
          </button>
        </Col>
        <Col md={10} style={columnStyle} >
          <div>{this.props.filename}</div>
        </Col>
      </Row>
    )
  }
}),

VideoFileDetails = (props) => {
  const nodes = props.files.map((filedata, index) =>
        <VideoFileDetailsRow key={index} {... props} index={index} filename={filedata.filename}/>);

  return (<div><Col md={9}>{nodes}</Col></div>);
};


module.exports = VideoFileDetails;