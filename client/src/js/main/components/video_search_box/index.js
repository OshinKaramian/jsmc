"use strict";
const $ = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const api = require('../../../common/api.js');
const keyboard = require('../../../common/keyboard.js');

module.exports = React.createClass({
  searchTimer: null,

  getInitialState: function() {
    return {
       searchResults: null
    };
  },

  handleOnChange: function(event) {
    const searchBoxValue = event.target.value;
    
    if (searchBoxValue.length > 2 || !searchBoxValue) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        if (!searchBoxValue) {
          this.props.onSearchBoxChange({searchContents: null});
        } else {
          api.media.search(searchBoxValue).then((data) => {
            this.props.onSearchBoxChange({searchContents: searchBoxValue, data: data});
            this.setState({searchResults: data});
          });
        }
      },1000);
    }
  },

  setEventListeners: function() {
      // escape
      keyboard.push(27, 'videodisplay', 'Leave search box', event => {
        if (document.querySelectorAll('.movies-search-box')[0] === document.activeElement) {
          document.body.focus();
          document.querySelectorAll('.movies-search-box')[0].blur();
        }
      });

      // f6
      keyboard.push(117, 'videodisplay', 'Enter search box', event => {
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