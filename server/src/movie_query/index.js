'use strict';
const Promise = require('bluebird');
const path = require('path');
const MovieType = require('./translator/movie');
const TvType = require('./translator/tv');

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

/**
   * Determines whether a given response is a valid object
   *
   * @param {array} movieDbResponse - Array returned from moviedb
   * @return {object} if response contains something valid it is returned
   *  name: search name of object, id: tmdb id of object
   */
const findValidObject = (searchTerm, moviedbResponse) => {
  let parsedResponses = moviedbResponse.results;

  const validResponses = parsedResponses.filter(response => {
      return response.release_date || response.first_air_date;
  });

  const addMatchPercentage = validResponses.map(response => {
      const searchWords = searchTerm
      .replace(/[+]/gi, ' ')
      .replace(/[^\w\s]/gi, ' ')
      .toLowerCase()
      .replace(/\s+/g,' ').trim()
      .split(' ');

      const title = (response.title || response.original_name)
      .replace(/[^\w\s]/gi, ' ')
      .toLowerCase()
      .replace(/\s+/g,' ').trim()
      .split(' ')

      const numWordsMatch = title.reduce((matchCount, titleWord) => {
      const matchIndex = searchWords.indexOf(titleWord);
      if (matchIndex >= 0) {
          searchWords.splice(matchIndex, 1);
          matchCount++;
      }

      return matchCount;
      }, 0);

      response.match_percentage =  numWordsMatch / title.length; 
      return response;
  });

  const correctMatch = addMatchPercentage.reduce((match, item) => {
      if (match.match_percentage < item.match_percentage) {
      return item
      }
      return match;
  }, { match_percentage: -1});
  

  if (!correctMatch || (!correctMatch.release_date && !correctMatch.first_air_date)) {
      throw new Error('No match available');
  } else {
      return {
      name: correctMatch.original_name || correctMatch.title,
      tmdb_id: correctMatch.id
      };
  }
}

module.exports = ({ moviedbKey }) => {
  const moviedb = require('./api/moviedb.js')({ apiKey: moviedbKey });

  /**
   * Queries moviedb repeatedly until finding a match or determining no match exists
   *
   * @param {string} filename - File name that is being queried
   * @param {string} category - Type of query, options are 'movie' and 'tv'
   * @param {string} year - Year to attach to query (not required)
   * @return {object} matching moviedb response, no filename exception if query fails
   */
  const queryMovieDbForMatch = async ({ filename, mediaType, year, searchTerm }) => {
    if (!filename || !searchTerm) {
      return new Promise((resolve, reject) => reject(new Error('No Filename for Query')));
    }

    searchTerm = sanitizeFilenameForSearch(searchTerm);

    const response = await moviedb.search(searchTerm, mediaType);

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
      } 

      const match = findValidObject(searchTerm, parsedResponse);

      match.filename = path.basename(filename);
      match.category = mediaType;

      return match;
    }

    if (response.statusCode === 429) {
      await delay(10000);
      
      return queryMovieDbForMatch({ 
        filename, 
        mediaType, 
        year,
        searchTerm
      });
    }

    throw new Error('Unexpected HTTP Status Code: ' + response.statusCode);
  };

  return async ({ filename, mediaType, year }) => {
    const queryInfo = await queryMovieDbForMatch({ filename, mediaType, year, searchTerm: filename})
    const mediaController = mediaType === 'tv' ? 
      new TvType({ moviedbKey, moviedbResponse: queryInfo }) :
      new MovieType({ moviedbKey, moviedbResponse: queryInfo });

    const details = await mediaController.getDetails();

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