"use strict";
var React = require('react/addons'),
    assert = require('assert'),
    VideoDisplay = require('../src/js/main/video_display'),
    movieList = require('./data/api.json'),
    TestUtils = React.addons.TestUtils;


describe('VideoDisplay component', function(){
  let detachedVideoDisplay;
  before(function() {
    var backgroundContainer = document.createElement('div');
    backgroundContainer.id = 'container-background';
    backgroundContainer.className = 'container-background-front';
    document.body.appendChild(backgroundContainer);
    detachedVideoDisplay = TestUtils.renderIntoDocument(<VideoDisplay movies={movieList} />);
  });

  it('should render correctly', function() {
    var posterImages = TestUtils.scryRenderedDOMComponentsWithTag(detachedVideoDisplay, 'img');

    assert.equal(posterImages.length, 2);
    assert.equal(posterImages[0].getAttribute('data-fileid'), movieList[0].id);
    assert.equal(posterImages[1].getAttribute('data-fileid'), movieList[1].id);
    assert(posterImages[0].getAttribute('src').indexOf(movieList[0].poster_path) > 0);
    assert(posterImages[1].getAttribute('src').indexOf(movieList[1].poster_path) > 0);
  });

  it('should change the background onclick', function() {
    var posterImages = TestUtils.scryRenderedDOMComponentsWithTag(detachedVideoDisplay, 'img');
    
    posterImages[0].click();
    console.log(document.getElementById('container-background').style);

  });
});
