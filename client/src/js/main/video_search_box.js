"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const api = require('../common/api.js');

var SearchBox = React.createClass({
  getInitialState: function() {
    return {
       searchResults: null
    };
  },
  
  handleOnChange: function(event) {
    let media = new api.Media();
    if (!event.target.value) {
      this.props.onSearchBoxChange();
    } else {
      media.search(event.target.value).then((data) => {
        this.props.onSearchBoxChange(data);
        this.setState({searchResults: data});
      });
    }
  },
  
  setEventListeners: function() {        
    document.addEventListener('keydown', function(event) {
      var keyPressed = String.fromCharCode(event.keyCode);
      
      if (document.querySelectorAll('.movies-search-box')[0] === document.activeElement && event.keyCode === 27) {
        document.body.focus();
        document.querySelectorAll('.movies-search-box')[0].blur();
      }
      
      if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement && keyPressed === 'S') {
        document.querySelectorAll('.movies-search-box')[0].focus();
        document.querySelectorAll('.movies-search-box')[0].select();
        event.preventDefault();
      }
    }.bind(this)); 
  },
  
  componentDidMount: function() {
    this.setEventListeners();
  },
  
  render: function() {
    let textboxStyle = {
      width: '200px'
    };
    
    return ( 
      <span>
        <input type="text" onChange={this.handleOnChange} style={textboxStyle} className="movies-search-box" />
      </span>      
    );
  }
});

module.exports = SearchBox;