/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const cheerio = require('cheerio');
const baseUrl = 'http://www.imdb.com/title';

const requester = (url) => {
  return request(url)
    .then(response => {
      const { body } = response;
      const $ = cheerio.load(body);
      return $;
    });
}

const basic = (imdbId) => {
  const queryUrl = baseUrl + '/' + imdbId;
  return requester(queryUrl)
    .then($ => {
      const rating = $('meta[itemprop="contentRating"]').attr('content');
      const imdbScore = $('span[itemprop="ratingValue"]').text();
      return {
        rating: rating,
        imdbScore: imdbScore
      };
    });
};

const awards = (imdbId) => {
  const queryUrl = baseUrl + '/' + imdbId;
  const awardQueryUrl = queryUrl + '/awards/'
  console.log(queryUrl);
  return requester(awardQueryUrl)
    .then($ => {
      let awardStatus = '';
      const awards = [];
      const academyAwards = $('.award_category:contains("Oscar")')
        .parent()
        .parent()
        .parent()
        .find('.award_description')
        .each((index, item) => {
           const possibleStatus = $(item).siblings().find('.title_award_outcome b').html()
           const status = possibleStatus || awardStatus;
           const awardCategory = $(item).html().split('<br>')[0].trim();
           awardStatus = status;

           awards.push({
             type: 'oscar',
             outcome: status,
             category: awardCategory
           })
        });

      return awards;
    });
};

module.exports.getById = (imdbId) => {
  return Promise.all([basic(imdbId), awards(imdbId)])
    .then(info => {
      const { rating = '', imdbScore = '' } = info[0];
      const awards = info[1] || [];
      const imdbInfo = {
        awards,
        rating, 
        imdbScore
      };

      return imdbInfo;
    })
};