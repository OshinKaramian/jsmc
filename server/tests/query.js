'use strict';
const assert = require('assert');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const query = require('../src/query.js');
const sinon = require('sinon');
const queryData = require('./data/file_system.json');

describe('Query', function() {
  
  before(function(done) {
    done();
  });
  
  beforeEach(function(done) {
    done();
  });
  
  describe('movie', function () {
    
    this.timeout(60000);
    
    it('should return a correct values for searches', function (done) {      
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
          assert.equal(queryOutput.title, data.output.title);
          return queryOutput;
        });
      };
      
      let tests = Promise.resolve(queryData).map(queryPromise,{concurrency: 1 });  

      tests.then((allFileContents) => { 
         done();
      }).catch((err) => done(err));     
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