"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const VideoDisplay = require('./video_display.js');
const VideoSearchBox = require('./video_search_box.js');
const CollectionSelector = require('./collection_selector.js');
const Bootstrap = require('bootstrap');
let api = require('../common/api.js');

let App = React.createClass({
  getInitialState: function() {
    return {
      data: null,
      currentCollection: null,
    };
  },
  
  searchBoxChange: function(values) {
    try {
      $('.carousel').slick('unslick');
    } catch (ex) {
      console.log(ex);
    }
    
    if (values) {
      this.setState({ data: values});
      let item = $('div[data-slick-index="0"').children().first();
      item.click();
    } else {
      let collection = new api.Collection(this.state.currentCollection);
      collection.get(this.state.currentCollection).then((data) => {
        this.setState({ data: data});
        var item = $('div[data-slick-index="0"').children().first();
        item.click();
      });
    }
  },
  
  selectChange: function(value) {
    try {
      $('.carousel').slick('unslick');
    } catch (ex) {
      console.log(ex);
    }
    
    this.setState({ 
      data: null
    });
    
    let collection = new api.Collection(value);
    collection.get(value).then((data) => {
      this.setState({ 
        data: data,
        currentCollection: value 
      });
      
      let item = $('div[data-slick-index="0"').children().first();
      item.click();
    });
  },
  
  componentDidMount: function() { 
    let configApi = new api.Config();
 
    configApi.get().then((config) => {
      let firstKey = Object.keys(config)[0];
      this.setState({
        currentCollection: firstKey
      }); 
      return firstKey;
    }).then((firstKey) => {
      let collection = new api.Collection(firstKey);
      return collection.get();
    }).then((data) => {
      this.setState({ data: data});    
      var item = $('div[data-slick-index="0"').children().first();
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
             &nbsp;&nbsp;<i className="fa fa-film fa-2x"></i> &nbsp;&nbsp;
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
    console.log('loaded');
    console.log(message);
    ReactDOM.render(<App />, document.getElementById('content')); 
  });
} else {
  ReactDOM.render(<App />, document.getElementById('content'));
}