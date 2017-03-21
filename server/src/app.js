"use strict";
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const Bootstrap = require('bootstrap');

let App = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },
  
  render: function() {
    
    return ( 
      <div>       
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('content'));