'use strict';
const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));

const config = require('../../config/');
const MAX_SIZE = 25000; // 25 Gig Max

const getDirectorySize = (directory) => {
  return fs.readdirAsync(directory)
    .then((files) => {
      const statPromises = files.map((file) => {
        const fileName = path.join(directory, file); 
        return fs.statAsync(fileName)
          .then((stat) => {
            stat.filename = fileName;
            return stat;
          });
      });

      return Promise.all(statPromises);
    })
    .then((values) => {
      const totalFileSize = values.reduce((sum, fileStat) => {
        console.log(fileStat);
        return sum + parseInt(fileStat.size); 
      }, 0);

      console.log(totalFileSize / 1000000);
    })
    .catch(exception => console.log(exception));
};

getDirectorySize(config.serverOptions.TEMP_DIR);