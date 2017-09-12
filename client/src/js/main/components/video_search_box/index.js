"use strict";
const $ = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const api = require('../../../common/api.js');
const keyboard = require('../../../common/keyboard.js');

module.exports = React.createClass({
  getInitialState: function() {
    return {
       searchResults: null
    };
  },

  handleOnChange: function(event) {
    let searchBoxValue = event.target.value;
    if (!event.target.value) {
      this.props.onSearchBoxChange({searchContents: null});
    } else {
      api.media.search(event.target.value).then((data) => {
        this.props.onSearchBoxChange({searchContents: searchBoxValue, data: data});
        this.setState({searchResults: data});
      });
    }
  },

  setEventListeners: function() {
      // escape
      keyboard.push(27, 'Leave search box', event => {
        if (document.querySelectorAll('.movies-search-box')[0] === document.activeElement) {
          document.body.focus();
          document.querySelectorAll('.movies-search-box')[0].blur();
        }
      });

      // f6
      keyboard.push(117, 'Enter search box', event => {
        if (document.querySelectorAll('.movies-search-box')[0] !== document.activeElement) {
          document.querySelectorAll('.movies-search-box')[0].focus();
          document.querySelectorAll('.movies-search-box')[0].select();
        }
      });
  },

  componentDidMount: function() {
    this.setEventListeners();
  },

  render: function() {
    let textboxStyle = {
      width: '200px',
      border: '0px 1px 0px 0px',
      borderBottom: 'white solid',
      fontSize: '18px'
    };

    return (
      <span>
        <input type="text" onChange={this.handleOnChange} style={textboxStyle} className="movies-search-box" />
      </span>
    );
  }
});