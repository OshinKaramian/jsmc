"use strict";
const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config.json');
let db;

MongoClient.connect(config.mongoUrl, { promiseLibrary: Promise })
  .then(function(database) {
     console.log("Connected correctly to server");
     db = database;
  });

module.exports.insertQuery = function(collectionName, data) {
  let db;

  return db.collection('movies').findOne({ "title": data.title  })
    .then(function(item) {
      if (!item) {
        console.log('Inserted new item for: ' + data.title);
        data.collection = collectionName;
        console.log(data);

        return db.collection('movies').insertOne(data);
      } else {
        console.log('Appending new file for: ' + data.title + ' filename: ' + data.filedata[0].filename);
        item.filedata.push(data.filedata[0]);
        return db.collection('movies').replaceOne({ "title" : data.title }, item);
      }
    })
    .catch(function(err) {
      console.error(err);
    }).finally(function() {
      db.close();
    });
};

module.exports.getMedia = function(collectionName, mediaId) {
  return db.collection(collectionName).findOne({ 'id' : parseInt(mediaId)});
};

module.exports.getCollection = function(collectionCategory, collectionName) {
  return db.collection(collectionCategory).find({ collection: collectionName }).sort({ title: 1}).toArray();
};
