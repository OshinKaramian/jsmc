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
      data: null,
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
    });    
  },
  
  render: function() {
    let controlStyle = { 
      position: 'fixed',
      top: '0',
      right: '20px'
    };
    
    let selectStyle = {
      background: 'black',
      color: 'white',
      float: 'left',
      marginRight: '20px'
    };
    
    let buttonStyle = {
      background: 'black',
      color: 'white',
      padding: '5px',
      float: 'left'
    };

    return (
      <div>       
        <div className="container-full">
          <VideoDisplay movies={this.state.data}/>
        </div>
        <div style={controlStyle}>
          <div style={selectStyle}>
             &nbsp;&nbsp;<i className="fa fa-film fa-2x"></i>
            <CollectionSelector collections={this.state.collectionInfo} onSelectChange={this.selectChange} />
          </div>
          <div style={buttonStyle}>
            <i className="fa fa-search fa-2x"></i> &nbsp;&nbsp;
            <VideoSearchBox onSearchBoxChange={this.searchBoxChange} />          
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