/**
 * @file Handles all database operations
 */
'use strict';
const Promise = require('bluebird');
const path = require('path');
const Database = require('nedb');
const defaultDbPath = path.join(__dirname,'..', 'db', 'jsmc.db');
let db;

let mediaSort = function(a,b) {
  if (a.title > b.title) return 1;
  if (a.title < b.title) return -1;

  return 0;
};

module.exports = function(dbPath) {
  dbPath = dbPath ? dbPath : defaultDbPath;

  let initDb = function() {
    if (!db) {
      db = new Database({ filename: dbPath, autoload: true});
      db = Promise.promisifyAll(db);
    }
  };

  initDb();

  return {

    initDb: initDb,

    /**
     * Inserts entry into database
     *
     * @param {string} collectionName - collection to add entry to
     * @param {object} data - data to insert into database
     * @return {object} database response
     */
    insertQuery(collectionName, data) {
      return db.findOneAsync({ 'title': data.title })
        .then(function(item) {
          if (!item) {
            data.collection = collectionName;
            return db.insertAsync(data);
          } else {
            item.filedata.push(data.filedata[0]);
            return db.updateAsync({ 'title' : data.title }, item);
          }
        })
        .catch(function(err) {
          throw err;
        });
    },

    /**
     * Gets a media object from the database
     *
     * @param {string} mediaId - id of entry to pull
     * @return {object} database response
     */
    getMedia(mediaId) {
      return db.findOneAsync({ 'id' : parseInt(mediaId)})
        .catch(function(error) {
          throw error;
        });
    },

    /**
     * Queries for media
     *
     * @param {string} query - data to query off of
     * @return {array} media objects based on query
     */
    findMedia(query) {
      const dbQuery = {
        $or: [
          { 'title' : new RegExp(query, 'i')},
          { 'director' : new RegExp(query, 'i')},
          { 'writer' : new RegExp(query, 'i')},
          { 'actors' : new RegExp(query, 'i')}
        ]
      };
      return db.findAsync(dbQuery)
        .then(function(items) {
          items.sort(mediaSort);
          return items;
        })
        .catch(function(error) {
          throw error;
        });
    },

    /**
     * Checks to see if a file exists, if one does throw an exception
     *
     * @param {string} filename - file that is being searched for
     */
    findFile(filename) {
      return db.findAsync({ 'filedata.filename': filename })
        .then(function(item) {
          if (item && item.length > 0) {
            throw new Error('File already indexed: ' + filename);
          }
          return filename;
        })
        .catch(function(error) {
          throw error;
        });
    },

    /**
     * Gets all media objects from a given collection
     *
     * @param {string} collectionName - collection to get media from
     * @return {array} media objects based on query
     */
    getCollection(collectionName) {
      return db.findAsync({ collection: collectionName })
        .then(function(items) {
          items.sort(mediaSort);
          return items;
        })
        .catch(function(error) {
          throw error;
        });
    }
  };
};