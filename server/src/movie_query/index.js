'use strict';
const queryTranslator = require('./query_translator.js');
const moviedb = require('./moviedb_api.js');
const Promise = require('bluebird');
const path = require('path');

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
 * Sanitizes filename so that it's queryable
 *
 * @param {string} filename - Filename that is to be sanitized for querying
 * @return {string} sanitized filename, safe for queries
 */
let sanitizeFilenameForSearch = function(filename) {
  let sanitizedFilename = path.basename(filename);

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
 * Queries moviedb repeatedly until finding a match or determining no match exists
 *
 * @param {string} filename - File name that is being queried
 * @param {string} category - Type of query, options are 'movie' and 'tv'
 * @param {string} year - Year to attach to query (not required)
 * @return {object} matching moviedb response, no filename exception if query fails
 */
module.exports.queryForValidObject = function({ filename, mediaType, year, searchTerm }) {
  if (!filename && !searchTerm) {
    return new Promise((resolve, reject) => reject(new Error('No Filename for Query')));
  }

  if (!searchTerm) {
    searchTerm = sanitizeFilenameForSearch(filename);
  } else {
    searchTerm = sanitizeFilenameForSearch(searchTerm);
  }

  return moviedb.search(searchTerm, mediaType, year)
  .then(function (response) {
    if (response.statusCode == 200) {
      let parsedResponse = JSON.parse(response.body);
      if (parsedResponse.total_results == 0) {
        let newQueryInfo = modifyFilenameForNextSearch(searchTerm); 

        return module.exports.queryForValidObject({ 
          filename: filename, 
          year: newQueryInfo.year,
          mediaType,
          searchTerm: newQueryInfo.filename
        });
      } else {
        const match = queryTranslator.findValidObject(searchTerm, parsedResponse);
        match.filename = path.basename(filename);
        match.category = mediaType;

        return match;
      }
    } else if (response.statusCode == 429) {
      return Promise.delay(10000).then(() => module.exports.queryForValidObject({ 
        filename, 
        mediaType, 
        year,
        searchTerm
      }));
    } else {
      throw new Error('Unexpected HTTP Status Code: ' + response.statusCode);
    }
  })
  .then(queryInfo => {
    return queryTranslator[mediaType].getDetails(queryInfo)
      .then(details => Object.assign(queryInfo, details));
  })
  .then(queryDetailsInfo => {
    if (mediaType === 'tv') {
      const metadata = module.exports.getFileInfo(filename);

      if (metadata.episode) {
      return moviedb.getEpisodeInfo(queryDetailsInfo.id, metadata.episode)
          .then(episodeInfo => {
            if (episodeInfo) {
              metadata.episode = Object.assign(metadata.episode, {
                name: episodeInfo.name,
                overview: episodeInfo.overview,
                image: episodeInfo.still_path ? `https://image.tmdb.org/t/p/original${episodeInfo.still_path}` : null,
                guest_stars: episodeInfo.guest_stars
              });
            }

            return Object.assign(queryDetailsInfo, metadata);
        });
      } 
    }

    return queryDetailsInfo;
  })
  .catch(function(error) {
    throw error;
  });
};

module.exports.getFileMetadata = function({ mediaType, metadata, id }) {
  if (mediaType === 'tv') {
    return moviedb.getEpisodeInfo(id, metadata.episode)
      .then(episodeInfo => {
        if (episodeInfo) {
          metadata.episode = Object.assign(metadata.episode, {
            name: episodeInfo.name,
            overview: episodeInfo.overview,
            image: episodeInfo.still_path ? `https://image.tmdb.org/t/p/original${episodeInfo.still_path}` : null,
            guest_stars: episodeInfo.guest_stars
          });
        }

        return metadata;
    });
  }

  return new Promise(resolve => resolve(''));
};

module.exports.getFileInfo = function(filename) {
  let episodeRegExp = new RegExp('(S[0-9][0-9]E[0-9][0-9])', 'i');
  let episodeNumbersRegExp = new RegExp('\\b[0-9]?[0-9][0-9][0-9]\\b', 'i');
  let episodeNumbersRegExpWithX = new RegExp('\\b[0-9]?[0-9]x[0-9][0-9]\\b', 'i');
  let episodeNumbersRegExpWithDash = new RegExp('\\b[0-9]?[0-9]-[0-9][0-9]\\b', 'i');
  let regExOutput = episodeRegExp.exec(filename);
  let episodeObject;

  if (!regExOutput) {
    regExOutput = episodeNumbersRegExp.exec(filename);
  } else {
    let splitObject = regExOutput[0].toLowerCase().slice(1).split('e');
    episodeObject = {
      episode: {
        season_number: parseInt(splitObject[0]),
        episode_number: parseInt(splitObject[1])
      }
    };
    return episodeObject;
  }

  if (!regExOutput) {
    regExOutput = episodeNumbersRegExpWithX.exec(filename);
  } else {
    let episodeNumber = regExOutput[0].slice(regExOutput[0].length - 2, regExOutput[0].length);
    let seasonNumber = regExOutput[0].substr(0, regExOutput[0].length - 2);

    episodeObject = {
      episode: {
        season_number: parseInt(seasonNumber),
        episode_number: parseInt(episodeNumber)
      }
    };

    return episodeObject;
  }

  if (!regExOutput) {
    regExOutput = episodeNumbersRegExpWithDash.exec(filename);
  } else {
    let splitObject = regExOutput[0].toLowerCase().slice(1).split('x');
    episodeObject = {
      episode: {
        season_number: parseInt(splitObject[0]),
        episode_number: parseInt(splitObject[1])
      }
    };

    return episodeObject;
  }

  if (regExOutput) {
    let splitObject = regExOutput[0].toLowerCase().slice(1).split('-');
    episodeObject = {
      episode: {
        season_number: parseInt(splitObject[0]),
        episode_number: parseInt(splitObject[1])
      }
    };

    return episodeObject;
  }

  return {};
};