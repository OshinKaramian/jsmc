'use strict';
const files = require('./files_config.json');
const server = require('./server.json');
const apiKeys = require('./keys.json');

module.exports = {
  collectionInfo: files,
  apiKeys: apiKeys,
  serverOptions: {
    'TEMP_DIR': server.TEMP_DIR.replace('{base_dir}', __dirname),
    'MAX_SIZE': server.MAX_SIZE * 1000000000
  }
};