'use strict';
const rewire = require('rewire');
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const sinon = require('sinon');
const expect = require('chai').expect;
const DirectoryManager = require('../src/directory_manager.js');

const testDataDir = path.join(__dirname, 'data', 'tmp');

const makeFile = (fileName) => {
  const fileDir = path.join(testDataDir, fileName);
  const content = `some file content stuff whatever`;

  return fs.mkdirsAsync(testDataDir).then(() => fs.writeFileAsync(fileDir, content));
};

describe('DirectoryManager', () => {
  describe('class', () => {
    let fileNameArray = [];

    beforeEach(() => {
      const numArray = Array.from(Array(200).keys());
      const createFiles = numArray.map(number => makeFile(`${number}.txt`));
      fileNameArray = numArray.map(number => `${testDataDir}/${number}.txt`);
      return Promise.all(createFiles);
    });

    afterEach(() => {
      fileNameArray = [];
      return fs.removeAsync(testDataDir);
    })

    it('should contain 200 files', async () => {
      const mgr = new DirectoryManager(testDataDir);
      await mgr.init();
      const fileKeys = mgr.stats.map(fileStats => fileStats.filename);
      expect(mgr.stats.length).to.equal(fileNameArray.length);
      return expect(fileNameArray).to.include.members(fileKeys);
    });

    it('should give the correct size of all items in the folder', async () => {
      const mgr = new DirectoryManager(testDataDir);
      await mgr.init();
      return expect(mgr.totalSize()).to.be.equal(6400);
    });

    it('should delete the correct number of files', async () => {
      const mgr = new DirectoryManager(testDataDir);
      await mgr.init();
      await mgr.deleteToSize(6080);
      expect(mgr.stats.length).to.be.equal(190);
      return expect(mgr.totalSize()).to.be.equal(6080);
    });
  });
})
