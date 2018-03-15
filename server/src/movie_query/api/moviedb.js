/**
 * @file moviedb to generate an object based on the filename
 */
'use strict';
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const config = require('../../config/config.json');
const apiBase = 'http://api.themoviedb.org/3';

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
};

module.exports = ({ apiKey }) => {
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
  const search = (filename, category, year) => {
    let queryUrl = apiBase + '/search/'+ category +'?api_key=' + apiKey + '&query=' + filename;

    if (year && year > 1920) {
      queryUrl += '&year=' + year;
    }

    return request(queryUrl);
  },

  getMovieDetails = (id) => {
    let queryUrl = apiBase + '/movie/'+ id +'?api_key=' + apiKey + '&append_to_response=external_ids,credits';
    return request(queryUrl)
      .then(response => {
        if (response.statusCode === 429) {
          return delay(10000).then(() => getMovieDetails(id));
        } else {
          return JSON.parse(response.body);
        }
      });
  },

  getTVDetails = (id) => {
    let queryUrl = apiBase + '/tv/'+ id + '?api_key=' + apiKey + '&append_to_response=external_ids,credits';
    return request(queryUrl)
      .then(response => {
        if (response.statusCode === 429) {
          return delay(10000).then(() => getTVDetails(id));
        } else {
          return JSON.parse(response.body);
        }
      });
  },

  getEpisodeInfo = (id, episodeInfo) => {
    let queryUrl = apiBase + '/tv/'+ id +
      '/season/' + episodeInfo.season_number +
      '/episode/' + episodeInfo.episode_number +
      '?api_key=' + apiKey;

    return request(queryUrl).then(function(response) {
      if (response.statusCode === 429) {
        return delay(10000).then(() => getEpisodeInfo(id, episodeInfo));
      } else {
        return JSON.parse(response.body);
      }
    });
  };

  return {
    search,
    getMovieDetails,
    getTVDetails,
    getEpisodeInfo
  }
};