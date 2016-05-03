"use strict";
var jsdom = require('jsdom');


var html = '<!doctype html><html><body></body></html>';

var window = jsdom.jsdom(html, {
  virtualConsole: jsdom.createVirtualConsole().sendTo(console),
  features: {
    FetchExternalResources: ["script", "img"],
    ProcessExternalResources: ["script"],
    SkipExternalResources: false
  }
}).defaultView;
var document = window.document;

//expose to other modules
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.location = window.location;
global.Image = window.Image;