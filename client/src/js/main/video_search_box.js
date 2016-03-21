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
  
  render: function() {
    let textboxStyle = {
      width: '200px'
    };
    
    return ( 
      <span>
        <input type="text" onChange={this.handleOnChange} style={textboxStyle} />
      </span>      
    );
  }
});

module.exports = SearchBox;