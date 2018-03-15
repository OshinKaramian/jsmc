const MediaType = require('./mediaType');

const convertToMediaObject = function(info) {
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

module.exports = class TvType extends MediaType {
  /**
   * Gets the title from a moviedb object
   *
   * @return {string} title of the given tv show
   */
  getTitle() {
    return this.moviedbResponse.original_name;
  };

  /**
   * Gets the release year
   *
   * @return {string} release year of the given tv show
   */
  getReleaseYear() {
    if (this.moviedbResponse.first_air_date) {
      return this.moviedbResponse.first_air_date.split('-')[0];
    } else {
      return null;
    }
  };

  async getDetails() {
    const details = await this.moviedbApi.getTVDetails(this.moviedbResponse.tmdb_id)
    return convertToMediaObject({ moviedb: details });
  };
};