"use strict";

const console = require('better-console');
const config = require('../config/config.json');
const indexConfig = require('../config/files_config.json');
const file = require('../src/file.js');

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
  process.exit(1);
})

console.log(indexConfig);

for (var collectionName in indexConfig) {
  console.log(collectionName);
  console.log(indexConfig[collectionName]);
  file.indexAllFiles(collectionName, indexConfig[collectionName]);
}
