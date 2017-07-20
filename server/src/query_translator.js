/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const moviedbApi = require('./moviedb_api.js');
const imdbApi = require('./imdb_api.js');

/**
 * Determines whether a given response is a valid object
 *
 * @param {array} movieDbResponse - Array returned from moviedb
 * @return {object} if response contains something valid it is returned
 *  name: search name of object, id: tmdb id of object
 */
module.exports.findValidObject = function(moviedbResponse) {
  let parsedResponses = moviedbResponse.results;
  let correctMatch;

  for (let responseIndex = 0; responseIndex < parsedResponses.length; responseIndex++) {
    let parsedMovieResponse = parsedResponses[responseIndex];
    if (parsedMovieResponse.release_date || parsedMovieResponse.first_air_date) {
      correctMatch = parsedMovieResponse;
      break;
    }
  }

  if (!correctMatch || (!correctMatch.release_date && !correctMatch.first_air_date)) {
    throw new Error('No match available');
  } else {
    return {
      name: correctMatch.original_name || correctMatch.title,
      tmdb_id: correctMatch.id
    };
  }
};

/**
 * Contains all functionality to transform and extract tv queries to a common format
 */
module.exports.tv = {

  /**
   * Gets the title from a moviedb object
   *
   * @param {object} movieDbResponse - moviedb object
   * @return {string} title of the given tv show
   */
  getTitle: function(movieDbResponse) {
    return movieDbResponse.original_name;
  },

  /**
   * Gets the release year
   *
   * @param {object} movieDbResponse - moviedb object
   * @return {string} release year of the given tv show
   */
  getReleaseYear: function(movieDbResponse) {
    if (movieDbResponse.first_air_date) {
      return movieDbResponse.first_air_date.split('-')[0];
    } else {
      return null;
    }
  },

  /**
   * Takes a movieDb and ombd object and converts to a common format
   *
   * @param {object} movieDbResponse - moviedb object
   * @param {object} omdbResponse - omdbapi object
   * @return {object} common format media object
   */
  convertResponsesToMediaObject: function(info) {
    let mediaObject = {
      title: info.moviedb.original_name,
      media_type: 'tv',
      id: info.moviedb.id,
      long_plot: info.moviedb.overview,
      release_date: info.moviedb.first_air_date,
      poster_path: info.moviedb.poster_path,
      backdrop_path: info.moviedb.backdrop_path,
      rated: '',//info.imdb.rating,
      director: info.moviedb.created_by[0].name,
      writer: info.moviedb.created_by[0].name,
      actors: '',
      metacritic_rating: '',
      awards: '',
      short_plot: '',
      imdb_rating: '',//info.imdb.imdbScore,
      imdb_id: info.moviedb.external_ids.imdb_id,
      tomato_meter: '',
      tomato_user_rating: '',
      tomato_image: ''
    };

    return mediaObject;
  },

  getDetails: (tmdbId) => {
    return moviedbApi.getTVDetails(tmdbId);
  },

  getFileInfo: function(filename) {
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

    return null;
  }
};

/**
 * Contains all functionality to transform and extract movie queries to a common format
 */
module.exports.movie = {

  /**
   * Gets the title from a moviedb object
   *
   * @param {object} movieDbResponse - moviedb object
   * @return {string} title of the given movie
   */
  getTitle: function(movieDbResponse) {
    return movieDbResponse.title;
  },

  /**
   * Gets the release year
   *
   * @param {object} movieDbResponse - moviedb object
   * @return {string} release year of the given movie
   */
  getReleaseYear: function(movieDbResponse) {
    if (movieDbResponse.release_date) {
      return movieDbResponse.release_date.split('-')[0];
    } else {
      return null;
    }
  },

  /**
   * Takes a movieDb and ombd object and converts to a common format
   *
   * @param {object} movieDbResponse - moviedb object
   * @param {object} omdbResponse - omdbapi object
   * @return {object} common format media object
   */
  convertResponsesToMediaObject: function(info) {
    const crew = info.moviedb.credits.crew;
    const directors = crew.filter(crewInfo => crewInfo.job === 'Director');
    const writers = crew.filter(crewInfo => crewInfo.job === 'Screenplay');
    let actors = info.moviedb.credits.cast;

    if (actors.length > 3) {
      actors = actors.splice(0,3);
    }

    let mediaObject = {
      title: info.moviedb.title,
      media_type: 'movie',
      id: info.moviedb.id,
      long_plot: info.moviedb.overview,
      release_date: info.moviedb.release_date,
      poster_path: info.moviedb.poster_path,
      budget: info.moviedb.budget,
      backdrop_path: info.moviedb.backdrop_path,
      genres: info.moviedb.genres,
      rated: info.moviedb.rating,//omdbResponse.Rated,
      director: directors.map(people => people.name).join(', '),//omdbResponse.Director,
      writer: writers.map(people => people.name).join(', '),//omdbResponse.Writer,
      actors: actors.map(people => people.name).join(', '),//omdbResponse.Actors,
      metacritic_rating: '',//omdbResponse.Metascore,
      awards: info.moviedb.awards,//omdbResponse.Awards,
      short_plot:'',// omdbResponse.Plot,
      imdb_rating: info.moviedb.imdbScore,//omdbResponse.imdbRating,
      imdb_id: '',//omdbResponse.imdbID,
      tomato_meter: '',//omdbResponse.tomatoMeter,
      tomato_user_rating: '',//omdbResponse.tomatoUserMeter,
      tomato_image: '',//omdbResponse.tomatoImage
    };
    return mediaObject;
  },

  getDetails: (tmdbid) => {
    let movieDbInfo = {};
    let imdbInfo = {};

    return moviedbApi.getMovieDetails(tmdbid)
      .then(movideDbOutput => {
        movieDbInfo = movideDbOutput;
        return imdbApi.getById(movideDbOutput.imdb_id);
      })
      .then(imdbOutput => {
        Object.assign(imdbOutput, movieDbInfo);
        return imdbOutput;
      })
  }
};
