"use strict";

const Promise = require('bluebird');
const path = require('path');
const walk = require('walk');
const console = require('better-console');
const config = require('../config/config.json');
const indexConfig = require('../config/files_config.json');
const file = require('../src/file.js');
const db = require('../src/db.js');

let indexAllFiles = function(collectionName, searchInfo) {
  let walker;
  let returnArray = [];
  let options = {
     followLinks: false
    };
  let directory = searchInfo.directory;
  let category = searchInfo.type;

  walker = walk.walk(directory, options);

  walker.on("directories", function (root, dirStatsArray, next) {
    next();
  });

  walker.on("file", function (root, fileStats, next) {
    console.log(fileStats.name);

    file.createRecord(root, fileStats.name, directory, category, collectionName)
    .finally(function() {
      return next();
    });
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    return next();
  });

  walker.on("end", function() {
    try {
      db.initDb();
    } catch(ex) {
    }
  }); 
}

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
  process.exit(1);
})

console.log(indexConfig);
for (var collectionName in indexConfig) {
  console.log(collectionName);
  console.log(indexConfig[collectionName]);
  indexAllFiles(collectionName, indexConfig[collectionName]);
}
