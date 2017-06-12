/**
 * @file Queries both omdbapi and moviedb to generate an object based on the filename
 */
'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const request = require('request');
const queryTranslator = require('./query_translator.js');
const db = require('./db.js')();

let Media = class Media {
  constructor(mediaInfo) {
    this.filedata = [];
    this.details = {};
    this.details.tmdb_id = mediaInfo.tmdb_id;
    this.details.name = mediaInfo.name;
    this.details.category = mediaInfo.category;
    this.details.filename= mediaInfo.filename;
    this.database = db;
  }

  getDetails() {
    const detailsOutput = {};

    return queryTranslator[this.details.category].getDetails(this.details.tmdb_id)
      .then((details) => {
        detailsOutput.moviedb = details;
        const formatDetails = queryTranslator[this.details.category].convertResponsesToMediaObject(detailsOutput);
        Object.assign(this.details, formatDetails);
        return this;
      });
  }

  getAssets() {
    let writeImage = function(image_url) {
      if (!image_url) {
        return new Promise(function(resolve) {
          resolve();
        });
      } else {
        let imageBaseUrl = 'http://image.tmdb.org/t/p/original';
        let imageFsPath = path.join(__dirname, '..', 'assets', image_url);
        let downloadImage = request(imageBaseUrl + image_url).pipe(fs.createWriteStream(imageFsPath));

        return new Promise(function(resolve){
          return fs.existsAsync(imageFsPath).then(() => {
            downloadImage.on('close',function(){
              resolve();
            });
          }).catch(() => resolve());
        });
      }
    };

    const writePoster = writeImage(this.details.poster_path);
    const getBackdrop = writeImage(this.details.backdrop_path);

    return Promise.all([writePoster, getBackdrop])
      .then(() => {
        if (this.details.poster_path) {
          this.details.poster_path = 'assets' + this.details.poster_path;
        }

        if (this.details.backdrop_path) {
          this.details.backdrop_path = 'assets' + this.details.backdrop_path;
        }
        return this;
      });
  }

  addFileData(fileMetadata) {
    let fileInfo = {
      filename: fileMetadata.format.filename,
      codecShort: fileMetadata.format.format_name,
      codecLong: fileMetadata.format.format_long_name,
      duration: fileMetadata.format.duration,
    };
    this.filedata.push(fileInfo);
    return this;
  }

  save(collectionName) {
    const databaseTranslated = Object.assign({}, this.details);
    databaseTranslated.filedata = this.filedata;
    return this.database.insertQuery(collectionName, databaseTranslated)
      .then(() => this);
  }

  set db(newDb) {
    this.database = newDb;
  }
};

module.exports = Media;