"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const React = require('react');
const VideoDisplay = require('./video_display.js');
const SearchWindow = require('./search_window.js');
const ReactDOM = require('react-dom');
const Bootstrap = require('bootstrap');
const api = require('../common/api.js');


let App = React.createClass({
  getInitialState: function() {
    return {
      data: []
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
      let collection = new api.Collection('movies');
      collection.get('Movies').then(function(data) {
        this.setState({ data: data});
        var item = $('div[data-slick-index="0"').children().first();
        item.click();
      }.bind(this));
    }
  },
  
  componentDidMount: function() { 
    let collection = new api.Collection('movies');
    collection.get('Movies').then(function(data) {
      this.setState({ data: data});    
      var item = $('div[data-slick-index="0"').children().first();
        item.click();
    }.bind(this));  
  },
  
  render: function() {
    let buttonStyle = {
      background: 'black',
      color: 'white',
      padding: '5px',
      position: 'fixed',
      top: '0',
      right: '20px',
      zIndex:'1' 
    };
    
    let modalStyles = {
      overlay: {
        zIndex: 10
      },
      content : {
        padding : '0px'
      }
    };
    
    return (
      <div>    
        <div style={buttonStyle} style={buttonStyle}>
          <i className="fa fa-search fa-2x" onClick={this.openModal}></i> &nbsp;&nbsp;
          <SearchWindow onSearchBoxChange={this.searchBoxChange} />
        </div>
        <div className="container-full">
          <VideoDisplay movies={this.state.data}/>
        </div>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('content'));