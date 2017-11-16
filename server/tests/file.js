'use strict';
const assert = require('assert');
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const os = require('os');
const sinon = require('sinon');
let file = rewire('../src/file.js');
const Database = require('nedb');
const expect = require('chai').expect;
const testDbPath = path.join(__dirname, 'data', 'file_test.db');
let db = rewire('../src/db.js')(testDbPath);

describe('file', function() {
  this.timeout(60000);
  before(() => {
    return file.__set__('db', db);
  });

  afterEach(() => {
    return fs.removeAsync(testDbPath);
  });

  describe('createRecord', () => {
    const baseDir = path.join('tmp', 'baseDir');

    file.__set__('ffprobe', (filePath) => {
      return Promise.resolve({
        format: {
          filename: filePath,
          format_name: 'fnm',
          format_long_name: 'format name long'
        },
        duration: 500
      });
    });

    it('can create a proper record for a tv show', () => {
      const fileName = path.join(baseDir, 'hannibal.213.hdtv-lol.mp4');
      const category = 'tv';
      const collectionName = 'Television';
      const expectedOutput = {
        name: 'Hannibal',
        category: 'tv',
        filename: 'hannibal.213.',
        title: 'Hannibal',
        media_type: 'tv',
        id: 40008,
        release_date: '2013-04-04',
        director: 'Bryan Fuller',
        writer: ''
      };

      return file.createRecord(fileName, baseDir, category, collectionName)
        .then(() => db.findMedia('Hannibal'))
        .then(queryOutput => expect(queryOutput[0]).to.include(expectedOutput));
    });

    it('can create a proper record for a movie', () => {
      const fileName = path.join(baseDir, 'Captain_America_The_Winter_Soldier.mpg');
      const category = 'movie';
      const collectionName = 'Movies';
      const expectedOutput = {
        name: 'Captain America: The Winter Soldier',
        category: 'movie',
        filename: 'captain_america_the_winter_soldier.mpg',
        title: 'Captain America: The Winter Soldier',
        media_type: 'movie',
        director: 'Joe Russo, Anthony Russo',
        writer: 'Christopher Markus, Stephen McFeely',
        actors: 'Chris Evans, Samuel L. Jackson, Scarlett Johansson',
        id: 100402
      };

      return file.createRecord(fileName, baseDir, category, collectionName)
        .then(() => db.findMedia('Captain'))
        .then(queryOutput => {
          console.log(queryOutput);
           return expect(queryOutput[0]).to.include(expectedOutput)
        });
    });

     it('can create a proper record for a movie', () => {
      const fileName = path.join(baseDir, 'Schindlers_list.mpg');
      const category = 'movie';
      const collectionName = 'Movies';
      const expectedOutput = {
        name: 'Schindler\'s List',
        category: 'movie'
      };

      return file.createRecord(fileName, baseDir, category, collectionName)
        .then(() => db.findMedia('Schindler'))
        .then(queryOutput => expect(queryOutput[0]).to.include(expectedOutput));
    });
  });



  describe('transcode', function() {
    this.timeout(60000);
    const tempDir = path.join('tests', 'tmp');

    beforeEach(() => {
      return fs.mkdirs(tempDir);
    });

    afterEach(() => {
      return fs.remove(tempDir);
    });

    it('can transcode a file to progressive mp4', (done) => {
      if (os.platform() === 'linux') {
        return;
      }

      const sampleFile = path.resolve(path.join('tests','files', 'testfile.mkv'));
      const videoStream = file.transcode(sampleFile);

      videoStream.on('end', () => {
        return done();
      });

      videoStream.on('error', (err) => {
        expect(err).to.be.null;
      });
    });
  });
});