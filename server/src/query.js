"use strict"
const Promise = require('bluebird');
const sleep = require('sleep');
const request = Promise.promisify(require('request'));
const config = require('../config/config.json');
const queryTranslator = require('./query_translator.js');

let movieDbQuery = function(filename, category, year) {
  let queryUrl = 'http://api.themoviedb.org/3/search/'+ category +'?api_key=' + config.apiKey + '&query=' + filename;

  if (year && year > 1920) {
    queryUrl += '&year=' + year;
  }

  //console.info('filename: ' + queryUrl);

  return request(queryUrl);
};

let queryForValidObject = function(filename, category, year) {
  if (!filename) {
    throw new Error('No Filename for Query');
  }

  return movieDbQuery(filename, category, year).then(function (response) {
    if (response.statusCode == 200) {
      let parsedResponse = JSON.parse(response.body);
      if (parsedResponse.total_results == 0) {
        let newQueryInfo = queryTranslator.modifyFilenameForNextSearch(filename);
        return queryForValidObject(newQueryInfo.filename, category, newQueryInfo.year);
      } else {
        return queryTranslator.findValidObject(parsedResponse);
      }
    } else if (response.statusCode == 429) {
      //console.error('Too many retries, waiting 10 seconds');
      sleep.sleep(10);
      return queryForValidObject(filename, category, year);
    } else {
      throw new Error('Unexpected HTTP Status Code: ' + response.statusCode);
    }
  }).catch(function(error) {
    throw error;
  });
};

let omdbQuery = function(matchedResponse) {
  let releaseYear = queryTranslator[category].getReleaseYear(matchedResponse);
  let searchTitle = queryTranslator[category].getTitle(matchedResponse);
  let omdbQueryUrl = 'http://www.omdbapi.com/?t=' + searchTitle + '&tomatoes=true&plot=short&r=json&y=' + releaseYear;

  //correctMatch = matchedResponse;
  //console.info(fileData.filename + ': ' + omdbQueryUrl);

  return request(omdbQueryUrl);
},

formatQueryOutput = function(data) {
  let filedata = [];

  if (data.queryInfo) {
    filedata.push({
      filename: data.metadata.format.filename,
      codecShort: data.metadata.format.format_name,
      codecLong: data.metadata.format.format_long_name,
      duration: data.metadata.format.duration,
    });

    data.queryInfo.filedata = filedata;
    return data.queryInfo;
  } else {
    throw new Error('No Query Info for ' + data.filename);
  }
};

module.exports = function(fileData, category, year) {
  let correctMatch;
  let filename = fileData.filename;
  
  filename = filename.split('.');
  filename = filename.join('+');
  filename = filename.split('_');
  filename = filename.join('+');
  filename = filename.split(' ');
  filename = filename.join('+');
  
  return queryForValidObject(filename, category, year).then(function(matchedResponse) {
    let releaseYear = queryTranslator[category].getReleaseYear(matchedResponse);
    let searchTitle = queryTranslator[category].getTitle(matchedResponse);
    let omdbQueryUrl = 'http://www.omdbapi.com/?t=' + searchTitle + '&tomatoes=true&plot=short&r=json&y=' + releaseYear;

    correctMatch = matchedResponse;
    //console.info(filename + ': ' + omdbQueryUrl);

    return request(omdbQueryUrl);
  }).then(function(response) {
    if (response.statusCode < 400) {
      let omdbParsedResponse = JSON.parse(response.body);
      let newObject = queryTranslator[category].convertResponsesToMediaObject(correctMatch, omdbParsedResponse);

      fileData.queryInfo = newObject;
    }

    return fileData;
  }).then(formatQueryOutput)
  .catch(function(error) {
    throw error;
  });
};

