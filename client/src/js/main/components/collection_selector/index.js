"use strict";
const React = require('react');
const ReactDOM = require('react-dom');
let api = require('../../../common/api.js');

let CollectionSelector = React.createClass({
  getInitialState: function() {
    return {
      collections: null
    };
  },

  componentDidMount: function() {
    api.config.get().then((config) => {
      this.setState({
        collections: config
      });
    })
  },

  handleOnChange: function(event) {
    this.props.onSelectChange(event.target.value);
  },

  render: function() {
    let collections = this.state.collections || [];
    let collectionsArray = Object.keys(collections);
    let nodes = collectionsArray.map(function(collection, index) {
      return (
        <option key={index} value={collection}>{collection}</option>
      )
    });

    let selectStyle = {
      border: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      height:'40px',
      paddingLeft: '20px',
      paddingRight: '20px',
      fontSize: '26px',
      backgroundColor: 'maroon',
      color: 'white',
      outline: 'none'
    }

    return (
      <select style={selectStyle} onChange={this.handleOnChange}>
          {nodes}
      </select>
    );
  }
});

module.exports = CollectionSelector;