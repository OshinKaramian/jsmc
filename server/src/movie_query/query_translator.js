/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const imdbApi = require('./imdb_api.js');

module.exports = ({ moviedbKey }) => {
  const moviedbApi = require('./moviedb_api.js')({ apiKey: moviedbKey });
    
  const tvConvert = function(info) {
    let mediaObject = {
      title: info.moviedb.name,
      media_type: 'tv',
      id: info.moviedb.id,
      long_plot: info.moviedb.overview,
      release_date: info.moviedb.first_air_date,
      poster_path: info.moviedb.poster_path,
      backdrop_path: info.moviedb.backdrop_path,
      rated: '',//info.imdb.rating,
      director: info.moviedb.created_by.map(creator => creator.name).join(','),
      writer: '',//info.moviedb.created_by[0].name,
      genres: info.moviedb.genres,
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
  };

  const movieConvert = function(info) {
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
  };



  return {
/**
 * Determines whether a given response is a valid object
 *
 * @param {array} movieDbResponse - Array returned from moviedb
 * @return {object} if response contains something valid it is returned
 *  name: search name of object, id: tmdb id of object
 */
findValidObject: function(searchTerm, moviedbResponse) {
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
},

/**
 * Contains all functionality to transform and extract tv queries to a common format
 */
tv: {

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
  convertResponsesToMediaObject: tvConvert,

  getDetails: ({ tmdb_id, filename }) => {
    return moviedbApi.getTVDetails(tmdb_id)
      .then(details => {
        const detailsOutput = {
          moviedb: details
        };
        
        return tvConvert(detailsOutput);
      });
  }
},

/**
 * Contains all functionality to transform and extract movie queries to a common format
 */
movie: {

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
  convertResponsesToMediaObject: movieConvert,

  getDetails: ({ tmdb_id }) => {
    let movieDbInfo = {};
    let imdbInfo = {};

    return moviedbApi.getMovieDetails(tmdb_id)
      .then(movideDbOutput => {
        movieDbInfo = movideDbOutput;
        return imdbApi.getById(movideDbOutput.imdb_id);
      })
      .then(imdbOutput => {
        Object.assign(imdbOutput, movieDbInfo);
        const detailsOutput = {
          moviedb: imdbOutput
        };

        return movieConvert(detailsOutput);
      });
  }
}
  }
};
