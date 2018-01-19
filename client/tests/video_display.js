"use strict";
let React = require('react');
let TestUtils = require('react-addons-test-utils');
let assert = require('assert');
let VideoDisplay = require('../src/js/main/components/video_display');
let movieList = require('./data/api.json');

describe('<VideoDisplay />', function(){
  this.timeout(20000);
  let detachedVideoDisplay;

  before(function(done) {
    let backgroundContainer = document.createElement('div');
    backgroundContainer.id = 'container-background';
    backgroundContainer.className = 'container-background-front';
    document.body.appendChild(backgroundContainer);
    detachedVideoDisplay = TestUtils.renderIntoDocument(<VideoDisplay movies={movieList} />);
    done()
  });

  it('should have 2 <VideoItem />s', function(done) {
    let posterImages = TestUtils.scryRenderedDOMComponentsWithTag(detachedVideoDisplay, 'img');
    assert.equal(posterImages.length, 2);
    done();
  });

  it('<VideoItem />s should have the correct information', function(done) {
    let posterImages = TestUtils.scryRenderedDOMComponentsWithTag(detachedVideoDisplay, 'img');
    assert.equal(posterImages[0].getAttribute('data-fileid'), movieList[0].id);
    assert.equal(posterImages[1].getAttribute('data-fileid'), movieList[1].id);
    assert(posterImages[0].getAttribute('data-lazy').indexOf(movieList[0].poster_path) > 0);
    assert(posterImages[1].getAttribute('data-lazy').indexOf(movieList[1].poster_path) > 0);
    done();
  });

  it('should have the correct background image when clicked', function(done) {
    let posterImages = TestUtils.scryRenderedDOMComponentsWithTag(detachedVideoDisplay, 'img');
    TestUtils.Simulate.click(posterImages[0].parentElement);
    assert((window.getComputedStyle(document.querySelector('.container-background-front')).backgroundImage).indexOf(movieList[0].backdrop_path) >= 0);
    done();
  });
});
