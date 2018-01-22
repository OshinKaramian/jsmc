/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const sleep = require('sleep');
const queryTranslator = require('./query_translator.js');
const moviedb = require('./moviedb_api.js');
const Media = require('./media.js');

/**
 * Prepares filename to be queried after a failed search
 *
 * @param {string} filename - File name that is being queried
 * @return {string} Modified file name for the next search
 */
let modifyFilenameForNextSearch = function(filename) {
  let lastIndex;

  filename = filename.split('+');
  lastIndex  = filename.pop();
  filename = filename.join('+');

  return {
    filename: filename,
    year: +lastIndex
  };
};

/**
 * Queries moviedb repeatedly until finding a match or determining no match exists
 *
 * @param {string} filename - File name that is being queried
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {object} matching moviedb response, no filename exception if query fails
 */
let queryForValidObject = function(filename, category, year) {
  if (!filename) {
    throw new Error('No Filename for Query');
  }

  return moviedb.search(filename, category, year).then(function (response) {
    if (response.statusCode == 200) {
      let parsedResponse = JSON.parse(response.body);
      if (parsedResponse.total_results == 0) {
        let newQueryInfo = modifyFilenameForNextSearch(filename);
        return queryForValidObject(newQueryInfo.filename, category, newQueryInfo.year);
      } else {
        const match = queryTranslator.findValidObject(filename, parsedResponse);
        return match;
      }
    } else if (response.statusCode == 429) {
      sleep.sleep(10);
      return queryForValidObject(filename, category, year);
    } else {
      throw new Error('Unexpected HTTP Status Code: ' + response.statusCode);
    }
  }).catch(function(error) {
    throw error;
  });
};

/**
 * Sanitizes filename so that it's queryable
 *
 * @param {string} filename - Filename that is to be sanitized for querying
 * @return {string} sanitized filename, safe for queries
 */
let sanitizeFilenameForSearch = function(filename) {
  let sanitizedFilename = filename;

  sanitizedFilename = sanitizedFilename.split('.');
  sanitizedFilename = sanitizedFilename.join('+');
  sanitizedFilename = sanitizedFilename.split('_');
  sanitizedFilename = sanitizedFilename.join('+');
  sanitizedFilename = sanitizedFilename.split(' ');
  sanitizedFilename = sanitizedFilename.join('+');
  sanitizedFilename = sanitizedFilename.split('-');
  sanitizedFilename = sanitizedFilename.join('+');

  return sanitizedFilename;
};

/**
 * Searches movie databases for the filename that matches a given entry
 *
 * @param {Object} fileData - Object containing file metadata 
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {return} queried object with data from moviedb and omdb, file system data appended as well
 */
module.exports = function(fileData, category, year) {
  let filename = sanitizeFilenameForSearch(fileData.filename);

  return queryForValidObject(filename, category, year)
    .then(movieData => {
      movieData.filename = fileData.filename;
      movieData.category = category;
      return new Media(movieData).getDetails();
    })
    .then(mediaObject => {
      return mediaObject.getAssets();
    })
    .then(mediaObject => mediaObject.addFileData(fileData.metadata))
    .catch((error) => {
      throw error;
    });
};