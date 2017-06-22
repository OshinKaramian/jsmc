'use strict';
const Promise = require('bluebird');
const path = require('path');
const walk = require('walk');
const fs = Promise.promisifyAll(require('fs-extra'));
//const MAX_SIZE = 25000; // 25 Gig Max
const getAllFiles = (directory) => {
  const walker = walk.walk(directory, {followLinks: false});
  const files = [];

  return new Promise(resolve => {
    walker.on('directories', function (root, dirStatsArray, next) {
      next();
    });

    walker.on('file', function (root, fileStats, next) {
      let filePath = path.join(root, fileStats.name);
      files.push(path.resolve(filePath));
      return next();
    });

    walker.on('errors', function (root, nodeStatsArray, next) {
      return next();
    });

    walker.on('end', function() {
      return resolve(files);
    });
  });
};

const sortByDate = (files) => {
  files.sort((a,b) => {
    return a.date.created.getTime() - b.date.created.getTime();
  });
};

const directoryManager = class DirectoryManager {
  constructor(dir) {
    this.workingDirectory = dir;
    this.stats = {};
  }

  async init() {
    const directory = this.workingDirectory;
    const fileStats = async (fileName) => {
      const stat = await fs.statAsync(fileName);
      return {
        filename: fileName,
        size: stat.size,
        date: {
          access: new Date(stat.atime),
          modified: new Date(stat.mtime),
          created: new Date(stat.ctime)
        }
      };
    };

    const files = await getAllFiles(directory);
    const fileInfoArray = files.map(file => fileStats(file));
    this.stats = await Promise.all(fileInfoArray);
    sortByDate(this.stats);
    return this;
  }

  totalSize() {
    return this.stats.reduce((sum, fileStat) => {
      return sum + parseInt(fileStat.size);
    }, 0);
  }

  async deleteToSize(desiredSize) {
    if(desiredSize >= this.totalSize()) {
      return this;
    }

    const deleteFiles = [];

    this.stats.some(() => {
      const deletedStat = this.stats.pop();
      deleteFiles.push(deletedStat.filename);
      return desiredSize >= this.totalSize();
    });

    const deletes = deleteFiles.map(file => fs.unlinkAsync(file));
    await Promise.all(deletes);
    await this.init();
    return this;
  }
};

module.exports = directoryManager;