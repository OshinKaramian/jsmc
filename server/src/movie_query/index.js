'use strict';
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
  if (filename.length === 1) {
    console.log('spooky');
    return {
      filename: null,
      year: null
    } 
  }

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

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
};

const parseEpisodeInfo = function(filename) {
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

module.exports = ({ moviedbKey }) => {
  const moviedb = require('./moviedb_api.js')({ apiKey: moviedbKey });
  const queryTranslator = require('./query_translator.js')({ moviedbKey });

  /**
   * Queries moviedb repeatedly until finding a match or determining no match exists
   *
   * @param {string} filename - File name that is being queried
   * @param {string} category - Type of query, options are 'movie' and 'tv'
   * @param {string} year - Year to attach to query (not required)
   * @return {object} matching moviedb response, no filename exception if query fails
   */
  const queryMovieDbForMatch = ({ filename, mediaType, year, searchTerm }) => {
    if (!filename || !searchTerm) {
      return new Promise((resolve, reject) => reject(new Error('No Filename for Query')));
    }

    searchTerm = sanitizeFilenameForSearch(searchTerm);

    return moviedb.search(searchTerm, mediaType, year).then((response) => {
      if (response.statusCode === 200) {
        const parsedResponse = JSON.parse(response.body);

        if (parsedResponse.total_results === 0) {
          let newQueryInfo = modifyFilenameForNextSearch(searchTerm); 

          return queryMovieDbForMatch({ 
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
      } else if (response.statusCode === 429) {
        return delay(10000).then(() => queryMovieDbForMatch({ 
          filename, 
          mediaType, 
          year,
          searchTerm
        }));
      } else {
        throw new Error('Unexpected HTTP Status Code: ' + response.statusCode);
      }
    });
  };

  return async ({ filename, mediaType, year }) => {
    const queryInfo = await queryMovieDbForMatch({ filename, mediaType, year, searchTerm: filename})
    const details = await queryTranslator[mediaType].getDetails(queryInfo)

    Object.assign(queryInfo, details);

    if (mediaType === 'tv') {
      const metadata = parseEpisodeInfo(filename);

      if (metadata.episode) {
        const episodeInfo = await moviedb.getEpisodeInfo(queryInfo.id, metadata.episode)

        if (episodeInfo) {
          metadata.episode = Object.assign(metadata.episode, {
            name: episodeInfo.name,
            overview: episodeInfo.overview,
            image: episodeInfo.still_path ? `https://image.tmdb.org/t/p/original${episodeInfo.still_path}` : null,
            guest_stars: episodeInfo.guest_stars
          });
        }

        return Object.assign(queryInfo, metadata);
      } 
    }

    return queryInfo;
  };
};