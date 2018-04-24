/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const Media = require('./media.js');
const Promise = require('bluebird');
const { apiKey } = require('../config/config.json');
const query = require('cinefile')({ moviedbKey: apiKey });



/**
 * Searches movie databases for the filename that matches a given entry
 *
 * @param {Object} fileData - Object containing file metadata 
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {return} queried object with data from moviedb and omdb, file system data appended as well
 */
module.exports = function(fileData, category, year) {
  const { filename } = fileData.metadata.format;
  return query({ filename, mediaType: category, year, searchTerm: filename })
    .then(movieData => {
      if (movieData.episode) {
        fileData.metadata.episode = movieData.episode;
      }

      return new Media(movieData);
    })
    .then(mediaObject => mediaObject.getAssets(fileData.metadata.format.filename))
    .then(mediaObject => {
      return mediaObject.addFileData(fileData.metadata)
    }).catch(ex => console.log(ex));
};