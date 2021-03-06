'use strict';
const assert = require('assert');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const query = require('../src/query.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const queryDataMovie = require('./data/file_system_movie.json');
const queryDataTv = require('./data/file_system_tv.json');

describe('Query', function() {

  before(function(done) {
    done();
  });

  beforeEach(function(done) {
    done();
  });

  describe('tv', function () {
    this.timeout(60000);

    queryDataTv.forEach(function(queryDataItem) {
      it(`should return a correct value for search on ${queryDataItem.input}`, function (done) {
        let queryPromise = function(data) {
          let queryObject = {
            filename: data.input,
            metadata: {
              format: {
                filename: data.input,
                format_name: "",
                format_long_name: "",
                duration: ""
              }
            }
          };

          return query(queryObject, 'tv', null)
          .then((queryOutput) => {
            expect(queryOutput.details.title).to.equal(data.output.title);
            return queryOutput;
          });
        };

        //let tests = Promise.resolve(queryData).map(queryPromise,{concurrency: 1 });

        queryPromise(queryDataItem)
          .then((queryOutput) => {
          //tests.then((allFileContents) => {
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('movie', function () {
    this.timeout(60000);

    queryDataMovie.forEach(function(queryDataItem) {
      it(`should return a correct value for search on ${queryDataItem.input}`, function (done) {
        let queryPromise = function(data) {
          let queryObject = {
            filename: data.input,
            metadata: {
              format: {
                filename: "",
                format_name: "",
                format_long_name: "",
                duration: ""
              }
            }
          };

          return query(queryObject, 'movie', null)
          .then((queryOutput) => {
            assert.equal(queryOutput.details.title, data.output.title);
            return queryOutput;
          });
        };

        queryPromise(queryDataItem).then((queryOutput) => {
           done();
        }).catch((err) => done(err));
      });
    });


    it('should return an error for non existent records', function (done) {
      let queryObject = {
        filename: 'xyzoiujdpu',
        metadata: {
          format: {
            filename: "",
            format_name: "",
            format_long_name: "",
            duration: ""
          }
        }
      };

      query(queryObject, 'movie', null)
        .then((queryOutput) => {
          done('Query returned data when it should not have: ' + queryOutput);
          return queryOutput;
        }).catch((exception) => {
          assert.equal('No Filename for Query', exception.message);
          done();
        });
      });
  });
});
