"use strict"
let imageBaseUrl ='http://image.tmdb.org/t/p/original';

module.exports = {
  modifyFilenameForNextSearch: function(filename) {
    let lastIndex;

    filename = filename.split('+');
    lastIndex  = filename.pop();
    filename = filename.join('+');

     return {
       filename: filename,
       year: +lastIndex
     };
  },

  findValidObject: function(moviedbResponse) {
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
  },

  tv: {
    getTitle: function(movieDbResponse) {
      return movieDbResponse.original_name;
    },

    getReleaseYear: function(movieDbResponse) {
      if (movieDbResponse.first_air_date) {
        return movieDbResponse.first_air_date.split('-')[0];
      } else {
        return null;
      }
    },

    convertResponsesToMediaObject: function(movieDbResponse, omdbResponse) {
      let mediaObject = {
        title: movieDbResponse.original_name,
        media_type: 'tv',
        id: movieDbResponse.id,
        long_plot: movieDbResponse.overview,
        release_date: movieDbResponse.first_air_date,
        poster_path: imageBaseUrl + movieDbResponse.poster_path,
        backdrop_path: imageBaseUrl + movieDbResponse.backdrop_path,
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
  },

  movie: {
    getTitle: function(movieDbResponse) {
      return movieDbResponse.title;
    },

    getReleaseYear: function(movieDbResponse) {
      if (movieDbResponse.release_date) {
        return movieDbResponse.release_date.split('-')[0];
      } else {
        return null;
      }
    },

    convertResponsesToMediaObject: function(movieDbResponse, omdbResponse) {
      let mediaObject = {
        title: movieDbResponse.title,
        media_type: 'movie',
        id: movieDbResponse.id,
        long_plot: movieDbResponse.overview,
        release_date: movieDbResponse.release_date,
        poster_path: imageBaseUrl + movieDbResponse.poster_path,
        backdrop_path: imageBaseUrl + movieDbResponse.backdrop_path,
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
  }
};
