module.exports = class MediaType {
  constructor({ moviedbKey, moviedbResponse }) {
    if (!moviedbKey || !moviedbResponse) {
        throw new Error('Missing required parameters in constructor');
    }
    this.moviedbApi = require('../api/moviedb.js')({ apiKey: moviedbKey });
    this.moviedbResponse = moviedbResponse;
  }
};
