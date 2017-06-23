/**
 * @file moviedb to generate an object based on the filename
 */
'use strict';
const Promise = require('bluebird');
const sleep = require('sleep');
const request = Promise.promisify(require('request'));
const config = require('../config/config.json');

const apiBase = 'http://api.themoviedb.org/3';

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
module.exports.search = (filename, category, year) => {
  let queryUrl = apiBase + '/search/'+ category +'?api_key=' + config.apiKey + '&query=' + filename;

  if (year && year > 1920) {
    queryUrl += '&year=' + year;
  }

  return request(queryUrl);
};

module.exports.getMovieDetails = (id) => {
  let queryUrl = apiBase + '/movie/'+ id +'?api_key=' + config.apiKey + '&append_to_response=external_ids,credits';
  return request(queryUrl)
    .then(response => {
      if (response.statusCode === 429) {
        sleep.sleep(10);
        return module.exports.getMovieDetails(id);
      } else {
        return JSON.parse(response.body);
      }
    });
};

module.exports.getTVDetails = (id) => {
  let queryUrl = apiBase + '/tv/'+ id + '?api_key=' + config.apiKey + '&append_to_response=external_ids,credits';
  return request(queryUrl)
    .then(response => {
      if (response.statusCode === 429) {
        sleep.sleep(10);
        return module.exports.getTVDetails(id);
      } else {
        return JSON.parse(response.body);
      }
    });
};

module.exports.getEpisodeInfo = (id, episodeInfo) => {
  let queryUrl = apiBase + '/tv/'+ id +
    '/season/' + episodeInfo.season_number +
    '/episode/' + episodeInfo.episode_number +
    '?api_key=' + config.apiKey;

  return request(queryUrl).then(function(response) {
    if (response.statusCode === 429) {
      sleep.sleep(10);
      return module.exports.getEpisodeInfo(id, episodeInfo);
    } else {
      return response;
    }
  });
};