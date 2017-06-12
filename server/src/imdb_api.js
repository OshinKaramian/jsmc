/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const cheerio = require('cheerio');
const baseUrl = 'http://www.imdb.com/title';

module.exports.getById = (imdbId) => {
  const queryUrl = baseUrl + '/' + imdbId;
  return request(queryUrl)
    .then(response => {
      const body = response.body;
      const $ = cheerio.load(body);
      const rating = $('meta[itemprop="contentRating"]').attr('content');
      const imdbScore = $('span[itemprop="ratingValue"]').text();
      return {
        rating: rating,
        imdbScore: imdbScore
      };
    });
};