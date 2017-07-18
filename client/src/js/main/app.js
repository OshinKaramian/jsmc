"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const VideoDisplay = require('./components/video_display');
const VideoSearchBox = require('./components/video_search_box');
const CollectionSelector = require('./components/collection_selector');
const Bootstrap = require('bootstrap');
const slider = require('./components/slider');
let api = require('../common/api.js');

let App = React.createClass({
  getInitialState: function() {
    return {
      data: undefined,
      currentCollection: null,
    };
  },

  searchBoxChange: function(searchInfo) {
    slider.deconstruct();

    if (searchInfo.searchContents || searchInfo.data) {
      this.setState({ data: searchInfo.data});
      let item = slider.findByIndex('0');
      item.click();
    } else {
      api.collection.get(this.state.currentCollection).then((data) => {
        this.setState({ data: data});
        var item = slider.findByIndex('0');
        item.click();
      });
    }
  },

  selectChange: function(value) {
    slider.deconstruct();

    this.setState({
      data: null
    });

    api.collection.get(value).then((data) => {
      this.setState({
        data: data,
        currentCollection: value
      });

      let item = slider.findByIndex('0');
      item.click();
    });
  },

  componentDidMount: function() {
    $('.fa-window-close-o').on('click', event => {
      window.close();
    });

    api.config.get().then((config) => {
      let firstKey = Object.keys(config)[0];
      console.log(firstKey);

      this.setState({
        currentCollection: 'Movies'
      });
      return 'Movies';
    }).then((firstKey) => {
      return api.collection.get(firstKey);
    }).then((data) => {
      this.setState({ data: data});
      var item = slider.findByIndex('0');
      item.click();
      // Hide loading screen
      setTimeout(() => $('#loading').fadeOut(1000), 1000);
    });
  },

  render: function() {
    let topBarStyle = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      height: '50px',
      width: '100%',
      background: 'maroon'
    };

    let controlStyle = {
      right: '0px',
      position: 'relative'
    }

    let selectStyle = {
      background: 'maroon',
      color: 'white',
      display: 'inline',
      float:'right',
      marginRight: '20px',
      marginTop: '5px'
    };

    let buttonStyle = {
      background: 'maroon',
      color: 'white',
      padding: '5px',
      float:'right',
      display: 'inline'
    };

    let closeStyle = {
      background: 'maroon',
      color: 'white',
      marginLeft: '10px',
      marginRight: '10px',
      float:'right',
      display: 'inline'
    };

    let menuStyle = {
      background: 'maroon',
      color: 'white',
      marginTop: '10px',
      marginLeft: '10px',
      marginRight: '10px',
      float:'left',
      display: 'inline'
    };

    return (
      <div>
        <div className="container-full">
          <VideoDisplay movies={this.state.data}/>
        </div>
        <div style={topBarStyle}>
          <div style={controlStyle}>
            <div style={menuStyle}>
              &nbsp;&nbsp;<i className="fa fa-film fa-2x"></i>
            </div>
            <div style={closeStyle}>
              &nbsp;&nbsp;<i className="fa fa-minus-square fa-2x"></i>
              &nbsp;&nbsp;<i className="fa fa-window-close-o fa-2x"></i>&nbsp;&nbsp;
            </div>
            <div style={buttonStyle}>
              <i className="fa fa-search fa-2x"></i> &nbsp;&nbsp;
              <VideoSearchBox onSearchBoxChange={this.searchBoxChange} />
            </div>
            <div style={selectStyle}>
              &nbsp;&nbsp;<i className="fa fa-film fa-2x"></i>
              <CollectionSelector collections={this.state.collectionInfo} onSelectChange={this.selectChange} />
            </div>

          </div>
        </div>
      </div>
    );
  }
});

if (window && window.process && window.process.type === "renderer") {
  var ipc = require('electron').ipcRenderer;

  ipc.on('data-loaded', function(event, message) {
    console.log('data-loaded');
    ReactDOM.render(<App />, document.getElementById('content'));
  });

} else {
  ReactDOM.render(<App />, document.getElementById('content'));
}