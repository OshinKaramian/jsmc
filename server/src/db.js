"use strict";
const Promise = require('bluebird');
const path = require('path');
const config = require('../config/config.json');
const Database = require('nedb');

let db = new Database({ filename: path.join(__dirname,'..', 'db', 'jsmc.db'), autoload: true});
db = Promise.promisifyAll(db);

module.exports.insertQuery = function(collectionName, data) {
  return db.findOneAsync({ "title": data.title  })
    .then(function(item) {
    console.log('found');
    console.log(item);
      if (!item) {
        console.log('Inserted new item for: ' + data.title);
        data.collection = collectionName;
        console.log(data);

        return db.insertAsync(data);
      } else {
        console.log('Appending new file for: ' + data.title + ' filename: ' + data.filedata[0].filename);
        item.filedata.push(data.filedata[0]);

        return db.insertAsync({ "title" : data.title }, item);
      }
    })
    .catch(function(err) {
      console.error(err);
      throw err;
    })
};

module.exports.getMedia = function(collectionName, mediaId) {
  return db.findOneAsync({ 'id' : parseInt(mediaId)});
};

module.exports.getCollection = function(collectionCategory, collectionName) {
  return db.findAsync({ collection: collectionName });
};
