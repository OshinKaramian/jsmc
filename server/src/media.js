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

  static getByMediaId(id) {
    return db.getMedia(id)
      .then(item => {
        const mediaObj = new Media(item);
        const { filedata } = item;
        delete item.filedata;
        const details = item;

        mediaObj.details = details;
        mediaObj.filedata = filedata;

        return mediaObj;
      });
  }

  getDetails() {
    const detailsOutput = {};

    return queryTranslator[this.details.category].getDetails(this.details)
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

    const { getFileInfo, getFileMetadata = new Promise() } = queryTranslator[this.details.category];

    if (getFileInfo) {
      fileInfo.metadata = getFileInfo(fileMetadata.format.filename);
    }

    return getFileMetadata({metadata: fileInfo.metadata, id: this.details.id, title: this.details.title})
      .then(metadata => {
        return fs.statAsync(fileInfo.filename)
          .catch(ex => {
            return {
              path: fileInfo.filename
            };
          });
      })
      .then(stats => {
        try {
          fileInfo.create_time = stats.ctime.getTime();
          fileInfo.access_time = stats.atime.getTime();
        } catch(ex) {
          fileInfo.create_time = '';
          fileInfo.access_time = '';
        }
        this.filedata.push(fileInfo);
        return this;
      });
  }

  save(collectionName) {
    const databaseTranslated = Object.assign({}, this.details);
    databaseTranslated.filedata = this.filedata;
    return this.database.insertQuery(collectionName, databaseTranslated)
      .then(() => this);
  }

  stat(index = 0) {
    return fs.statAsync(this.filedata[index].filename)
      .then(stats => {
        stats.path = this.filedata[index].filename;
        stats.duration = this.filedata[index].duration;
        return stats;
      });
  }

  transcode(index = 0) {
  };

  set db(newDb) {
    this.database = newDb;
  }
};

module.exports = Media;