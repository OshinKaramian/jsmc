/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
"use strict"
const Promise = require('bluebird');
const sleep = require('sleep');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const request = Promise.promisify(require('request'));
const cbRequest = require('request');
const config = require('../config/config.json');
const queryTranslator = require('./query_translator.js');

/** 
 * Queries themoviedb.org for movie information return format is:
 * "results": [
 *  {
 *     "adult"
 *     "backdrop_path"
 *     "genre_ids"
 *     "id"
 *     "original_language"
 *     "original_title"
 *     "overview"
 *     "release_date"
 *     "poster_path"
 *     "popularity"
 *     "title"
 *     "video"
 *     "vote_average"
 *     "vote_count"
 *  }
 * ]
 * 
 * @param {string} filename - File name that is being queried
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {object} moviedb response
 */
let movieDbQuery = function(filename, category, year) {
  let queryUrl = 'http://api.themoviedb.org/3/search/'+ category +'?api_key=' + config.apiKey + '&query=' + filename;

  if (year && year > 1920) {
    queryUrl += '&year=' + year;
  }

  return request(queryUrl);
};

let movieDbQueryEpisodeInfo = function(id, episodeInfo) {
  let queryUrl = 'http://api.themoviedb.org/3/tv/'+ id +
    '/season/' + episodeInfo.season_number + 
    '/episode/' + episodeInfo.episode_number +
    '?api_key=' + config.apiKey;

  return request(queryUrl).then(function(response) {
    if (response.statusCode === 429) {
      sleep.sleep(10);
      return movieDbQueryEpisodeInfo(id, episodeInfo);
    } else {
      return response;
    }
  });
};

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

  return movieDbQuery(filename, category, year).then(function (response) {
    if (response.statusCode == 200) {
      let parsedResponse = JSON.parse(response.body);
      if (parsedResponse.total_results == 0) {
        let newQueryInfo = modifyFilenameForNextSearch(filename);
        return queryForValidObject(newQueryInfo.filename, category, newQueryInfo.year);
      } else {
        return queryTranslator.findValidObject(parsedResponse);
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
 * Queries omdbapi.com for movie information return format is:
 *
 * {
 *   "Title"
 *   "Year"
 *   "Rated"
 *   "Released"
 *   "Runtime"
 *   "Genre"
 *   "Director"
 *   "Writer"
 *   "Actors"
 *   "Plot"
 *   "Language"
 *   "Country"
 *   "Awards"
 *   "Poster"
 *   "Metascore"
 *   "imdbRating"
 *   "imdbVotes"
 *   "imdbID"
 *   "Type"
 *   "Response"
 * }
 * 
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {object} moviedb response
 */
let omdbQuery = function(category, movieDbMatch) {
  let releaseYear = queryTranslator[category].getReleaseYear(movieDbMatch);
  let searchTitle = queryTranslator[category].getTitle(movieDbMatch);
  let omdbQueryUrl = 'http://www.omdbapi.com/?t=' + searchTitle + '&tomatoes=true&plot=short&r=json&y=' + releaseYear;

  return request(omdbQueryUrl).then((response) => {
    if (response.statusCode < 400) {
      let omdbParsedResponse = JSON.parse(response.body);
      let newObject = queryTranslator[category].convertResponsesToMediaObject(movieDbMatch, omdbParsedResponse);  
      
      return newObject;
    } else {
      return movieDbMatch;
    }      
  });
};

/** 
 * Takes output from both queries and adds file info to object
 * 
 * @param {object} data - fileInfo object
 * @return {object} appending fileInfo object
 */
let formatQueryOutput = function(category, data) {
  let filedata = [];

  if (data.queryInfo) {
    let fileInfo = {
      filename: data.metadata.format.filename,
      codecShort: data.metadata.format.format_name,
      codecLong: data.metadata.format.format_long_name,
      duration: data.metadata.format.duration,
    };
    
    if (queryTranslator[category].getFileInfo) {
      let output = queryTranslator[category].getFileInfo(data.metadata.format.filename);
      if (output) {
        fileInfo = Object.assign(fileInfo, output); 
      }
      
      if (!fileInfo.episode) {
        filedata.push(fileInfo);
        data.queryInfo.filedata = filedata;
        return data.queryInfo;
      }

      return movieDbQueryEpisodeInfo(data.queryInfo.id, fileInfo.episode).then(function(response) {
        let jsonParsed = {};
        try {
          jsonParsed = JSON.parse(response.body);
        } catch (exception) {
        }
        
        fileInfo.episode = Object.assign(fileInfo.episode, jsonParsed);
        if (fileInfo.episode.still_path) {
          fileInfo.episode.still_path = 'http://image.tmdb.org/t/p/original' + fileInfo.episode.still_path;
        }
        filedata.push(fileInfo);
        data.queryInfo.filedata = filedata;
        return data.queryInfo;
      });
    } else {
      filedata.push(fileInfo);
      data.queryInfo.filedata = filedata;
      return data.queryInfo;
    }    
  } else {
    throw new Error('No Query Info for ' + data.filename);
  }
};

/** 
 * Downloads image assets to a folder
 * 
 * @param {object} movieDbResponse - Response from moviedbquery
 * @return {object} returns moviedbresponse that was passed in (for use on future promises)
 */
let downloadAndSaveAssets = function(movieDbResponse) {  
  let writeImage = function(image_url) {
    if (!image_url) {
      console.log(movieDbResponse);
      return new Promise(function(resolve, reject) {
        resolve();
      });
    } else {
      let imageBaseUrl = 'http://image.tmdb.org/t/p/original';
      let imageFsPath = path.join(__dirname, '..', 'assets', image_url);
      let downloadImage = cbRequest(imageBaseUrl + image_url).pipe(fs.createWriteStream(imageFsPath));
      
      return new Promise(function(resolve, reject){
        return fs.existsAsync(imageFsPath).then((exists) => {
          downloadImage.on("close",function(){        
            resolve();
          });        
        }).catch((exception) => resolve()); 
      });
    }
  }

  return writeImage(movieDbResponse.poster_path)
    .then(() => writeImage(movieDbResponse.backdrop_path))
    .then(() => {
      if (movieDbResponse.poster_path) {
        movieDbResponse.poster_path = 'assets' + movieDbResponse.poster_path;
      } 
  
      if (movieDbResponse.backdrop_path) {
        movieDbResponse.backdrop_path = 'assets' + movieDbResponse.backdrop_path;
      }
  
      return movieDbResponse
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
 * Sanitizes filename so that it's queryable
 * 
 * @param {string} filename - File name that is being queried
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {return} queried object with data from moviedb and omdb, file system data appended as well
 */
module.exports = function(fileData, category, year) {
  let filename = sanitizeFilenameForSearch(fileData.filename);

  return queryForValidObject(filename, category, year)
    .then(downloadAndSaveAssets)
    .then(omdbQuery.bind(this, category))
    .then((updateQueryObject) => {
      fileData.queryInfo = updateQueryObject;
      return fileData;
    })
    .then(formatQueryOutput.bind(this, category))
  .catch((error) => {
    throw error;
  });
};