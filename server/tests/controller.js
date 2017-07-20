'use strict';
const assert = require('assert');
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const expect = require('chai').expect;
const fs = Promise.promisifyAll(require('fs-extra'));
let controller = rewire('../src/controller.js');
const Database = require('nedb');
const testDbPath = path.join(__dirname, 'data', 'test.db');
let db = rewire('../src/db.js')(testDbPath);
const sinon = require('sinon');
let request = {};

let mockReply = {
  statusCode: 200,

  status(code) {
    this.statusCode = code;
    return this;
  },

  send(body) {
    return {body: body, statusCode: this.statusCode};
  },
  json(body) {
    return {body: body, statusCode: 200};
  }
};

describe('Controller', function() {

  before(function(done) {
    controller.__set__('db', db);
    done();
  });

  beforeEach(function(done) {
    request.params = {};
    request.query = {};
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
        assert.equal('assets/f2pj3SSj1GdFSrS5bUojT56umL6.jpg', mediaObject.poster_path);
        assert.equal('assets/rOzFJMPj1h5AFO1SzQtGWmyaNjV.jpg', mediaObject.backdrop_path);
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

  describe('/collection?query GET', function () {
    it('should return a list for a valid query', function(done) {
      request.query.query = 'dark';
      controller.media.search(request, mockReply).then(function(response) {
        let mediaObjectList = response.body;

        assert.equal(mediaObjectList.length, 6);
        mediaObjectList.forEach((media) => assert(media.title.indexOf('Dark') >= 0 || media.title.indexOf('dark') >= 0));

        done();
      }).catch(function(error) {
        done(error);
      });
    });
  });

  describe('/collection/{collectionName}/genres GET', function () {
    it('should get a distinct list of genres for a collection that exists', () => {

      request.params.collection = 'Movies';
      const expectedGenres = [ 
        'Action',
        'Adventure',
        'Animation',
        'Comedy',
        'Crime',
        'Documentary',
        'Drama',
        'Family',
        'Fantasy',
        'Foreign',
        'History',
        'Horror',
        'Music',
        'Mystery',
        'Romance',
        'Science Fiction',
        'TV Movie',
        'Thriller',
        'War',
        'Western'
      ];
      return controller.collection.genres(request, mockReply)
        .then((response) => {
          return expect(expectedGenres).to.deep.equal(response.body.items);
        });
    });
  });

  describe('/collection/{collectionName} GET', function () {
    it('should return the correct collection', function (done) {
      request.params.collection = 'Movies';
      controller.collection.get(request, mockReply).then(function(collection) {
        assert.equal(collection.body.length, 619);
        assert.equal(collection.body[0].title, '(500) Days of Summer');
        assert.equal(collection.body[618].title, 'Zone of the Dead')
        return done();
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