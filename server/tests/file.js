'use strict';
const assert = require('assert');
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const sinon = require('sinon');
let file = rewire('../src/file.js');
const Database = require('nedb');
const expect = require('chai').expect;
const testDbPath = path.join(__dirname, 'data', 'file_test.db');
let db = rewire('../src/db.js')(testDbPath);


describe('file', function() {

  before(() => {
    return file.__set__('db', db);
  });

  afterEach(() => {
    return fs.unlinkAsync(testDbPath);
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
      return file.createRecord(fileName, baseDir, category, collectionName)
        .then(queryOutput => {
          return db.findMedia('Hannibal');
        })
        .then(queryOutput => {
          const expectedOutput = {
            name: 'Hannibal',
            category: 'tv',
            filename: 'hannibal.213.',
            title: 'Hannibal',
            media_type: 'tv',
            id: 40008,
            release_date: '2013-04-04',
            director: 'Bryan Fuller',
            writer: 'Bryan Fuller'
          }

          return expect(queryOutput[0]).to.include(expectedOutput);
        })
    });

    it('can create a proper record for a movie', () => {
      const fileName = path.join(baseDir, 'Captain_America_The_Winter_Soldier.mpg');
      const category = 'movie';
      const collectionName = 'Movies';
      return file.createRecord(fileName, baseDir, category, collectionName)
        .then(queryOutput => {
          return db.findMedia('Captain');
        })
        .then(queryOutput => {
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
          }

          return expect(queryOutput[0]).to.include(expectedOutput);
        })
    });
  });
});