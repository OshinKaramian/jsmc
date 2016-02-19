"use strict";
const assert = require('assert');
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
let controller = rewire('../src/controller.js');
const Database = require('nedb');
const testDbPath = path.join(__dirname, 'data', 'test.db');
let db = rewire('../src/db.js')(testDbPath);
const sinon = require('sinon');
let request = {};

let mockReply = function (body) {
  return {
    header: function(key, value) {
      return { body: body, statusCode: 200};
    },
    code: function(statusCode) {
      return { body: body, statusCode: statusCode};
    }
  }; 
};

describe('Controller', function() {
  
  before(function(done) {
    controller.__set__('db', db);
    done();
  });
  
  beforeEach(function(done) {
    request.params = {};
    done();
  });
  
  describe('/media/{mediaId} GET', function () {
    it('should return a valid object for a valid media id', function (done) {
      request.params.mediaId = '10658';
      controller.media.get(request, mockReply).then(function(response) {
        let mediaObject = response.body;
        assert.equal('200', response.statusCode);
        assert.equal('10658', mediaObject.id);
        assert.equal('Howard the Duck', mediaObject.title);
        assert.equal('http://image.tmdb.org/t/p/original/f2pj3SSj1GdFSrS5bUojT56umL6.jpg', mediaObject.poster_path);
        assert.equal('http://image.tmdb.org/t/p/original/rOzFJMPj1h5AFO1SzQtGWmyaNjV.jpg', mediaObject.backdrop_path);
        done();
      }).catch(function(error) {
        done(error);
      });
    });
    
    it('should return an error for an invalid media id', function (done) {
      request.params.mediaId = '1';
      controller.media.get(request, mockReply).then(function(response) {
        assert.equal('404', response.statusCode);
        assert.equal('Media ID 1 does not exist.', response.body);
        done();
      }).catch(function(error) {
        done(error);
      });
    });    
  });
  
  describe('/media/{mediaId}/file/{fileIndex}/transcode POST', function () {
    it('should return a valid object url for a file while transcoding', function (done) {
      done();
    });
    
    it('should return a valid object url for a file that has been transcoded', function (done) {
      done();
    });  
    
    it('should return an error for an id that doesn\'t exist', function (done) {
      done();
    }); 
    
        
    it('should return an error for an file that has difficulty being transcoded', function (done) {
      done();
    });   
  }); 
  
  describe('/config/ GET', function () {
    it('should return the correct config', function (done) {
      var expectedJson;
      fs.readJsonAsync(path.join(__dirname, '..', 'config', 'files_config.json'))
        .then(function(json) {
          expectedJson = json;
          return controller.config.get(request, mockReply);
        })
        .then(function(response) {
          assert.equal(JSON.stringify(response.body), JSON.stringify(expectedJson));
          done();
        })
        .catch(function(error) {
          done(error);
        });    
      });
  }); 
  
  describe('/collection/{collectionName} GET', function () {
    it('should return the correct collection', function (done) {
      request.params.collection = 'Movies';
      controller.collection.get(request, mockReply).then(function(collection) {
        assert(collection.body.length, 514);
        assert.equal(collection.body[0].title, 'A Prophet');
        assert.equal(collection.body[513].title, 'I\'m Not There.')
        done();
      })
      .catch(function(error) {
        done(error);
      });
    });
    
    it('should return no items if the collection doesn\'t exist', function (done) {
      request.params.collection = 'Fake';
      controller.collection.get(request, mockReply).then(function(collection) {
        assert.equal(collection.body.length, 0);
        done();
      })
      .catch(function(error) {
        done(error);
      });
    });
    
    it('should return the config if no collection name is given', function (done) {
      done();
    });
  }); 
  
});