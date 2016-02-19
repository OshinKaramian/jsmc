"use strict";
const Promise = require('bluebird');
const path = require('path');
const config = require('../config/config.json');
const Database = require('nedb');
const defaultDbPath = path.join(__dirname,'..', 'db', 'jsmc.db');
let db;

module.exports = function(dbPath) {
  dbPath = dbPath ? dbPath : defaultDbPath;
  db = new Database({ filename: dbPath, autoload: true});
  db = Promise.promisifyAll(db);
  
  return {
    insertQuery: function(collectionName, data) {
      return db.findOneAsync({ "title": data.title  })
        .then(function(item) {
          if (!item) {
          //  console.log('Inserted new item for: ' + data.title);
            data.collection = collectionName;
           // console.log(data);

            return db.insertAsync(data);
          } else {
          //  console.log('Appending new file for: ' + data.title + ' filename: ' + data.filedata[0].filename);
            item.filedata.push(data.filedata[0]);

            return db.updateAsync({ "title" : data.title }, item);
          }
        })
        .catch(function(err) {
        //  console.error(err);
          throw err;
        })
    },

    getMedia: function(collectionName, mediaId) {
      return db.findOneAsync({ 'id' : parseInt(mediaId)})
        .catch(function(error) { 
          throw error; 
        });
    },

    getCollection: function(collectionCategory, collectionName) {
      return db.findAsync({ collection: collectionName });
    }
  };
}