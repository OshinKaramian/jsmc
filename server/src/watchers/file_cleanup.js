const DirectoryManager = require('../directory_manager.js');
const config = require('../../config/');

const run = async() => {
  const mgr = new DirectoryManager(config.serverOptions.TEMP_DIR);
  await mgr.init();
  await mgr.deleteToSize(config.serverOptions.MAX_SIZE);
};

module.exports = run;