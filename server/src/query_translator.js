/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
"use strict"

/**
 * Determines whether a given response is a valid object
 * 
 * @param {array} movieDbResponse - Array returned from moviedb
 * @return {object} if response contains something valid it is returned
 */
module.exports.findValidObject = function(moviedbResponse) {
  let parsedResponses = moviedbResponse.results;
  let responseIndex = 0;
  let correctMatch;

  for (let responseIndex = 0; responseIndex < parsedResponses.length; responseIndex++) {
    let parsedMovieResponse = parsedResponses[responseIndex];
    if (parsedMovieResponse.release_date || parsedMovieResponse.first_air_date) {
      correctMatch = parsedMovieResponse;
      break;
    }
  }

  if (!correctMatch || (!correctMatch.release_date && !correctMatch.first_air_date)) {
    throw new Error("No match available");
  } else {
    return correctMatch;
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
  convertResponsesToMediaObject: function(movieDbResponse, omdbResponse) {
    let mediaObject = {
      title: movieDbResponse.original_name,
      media_type: 'tv',
      id: movieDbResponse.id,
      long_plot: movieDbResponse.overview,
      release_date: movieDbResponse.first_air_date,
      poster_path: movieDbResponse.poster_path,
      backdrop_path: movieDbResponse.backdrop_path,
      rated: omdbResponse.Rated,
      director: omdbResponse.Director,
      writer: omdbResponse.Writer,
      actors: omdbResponse.Actors,
      metacritic_rating: omdbResponse.Metascore,
      awards: omdbResponse.Awards,
      short_plot: omdbResponse.Plot,
      imdb_rating: omdbResponse.imdbRating,
      imdb_id: omdbResponse.imdbID,
      tomato_meter: omdbResponse.tomatoMeter,
      tomato_user_rating: omdbResponse.tomatoUserMeter,
      tomato_image: omdbResponse.tomatoImage
    };
    return mediaObject;
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
  convertResponsesToMediaObject: function(movieDbResponse, omdbResponse) {
    let mediaObject = {
      title: movieDbResponse.title,
      media_type: 'movie',
      id: movieDbResponse.id,
      long_plot: movieDbResponse.overview,
      release_date: movieDbResponse.release_date,
      poster_path: movieDbResponse.poster_path,
      backdrop_path: movieDbResponse.backdrop_path,
      rated: omdbResponse.Rated,
      director: omdbResponse.Director,
      writer: omdbResponse.Writer,
      actors: omdbResponse.Actors,
      metacritic_rating: omdbResponse.Metascore,
      awards: omdbResponse.Awards,
      short_plot: omdbResponse.Plot,
      imdb_rating: omdbResponse.imdbRating,
      imdb_id: omdbResponse.imdbID,
      tomato_meter: omdbResponse.tomatoMeter,
      tomato_user_rating: omdbResponse.tomatoUserMeter,
      tomato_image: omdbResponse.tomatoImage
    };
    return mediaObject;
  }
};
