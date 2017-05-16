'use strict';
const assert = require('assert');
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const sinon = require('sinon');
let file = rewire('../src/file.js');
const Database = require('nedb');
const testDbPath = path.join(__dirname, 'data', 'file_test.db');
let db = rewire('../src/db.js')(testDbPath);


describe('file', function() {

  before((done) => {
    file.__set__('db', db);
    done();
  });

  beforeEach((done) => {
    done();
  });

  describe('createRecord', () => {
    it('', () => {

      file.indexAllFiles()

    });
  });
});