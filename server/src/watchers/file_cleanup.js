const DirectoryManager = require('../directory_manager.js');

const convertToMeg = (filesize) => {
  return filesize / 1000000.0;
};

const run = async() => {
  //const mgr = new DirectoryManager(config.serverOptions.TEMP_DIR);
  const mgr = new DirectoryManager('../server/src/');
  await mgr.init();

  mgr.stats.forEach(file => console.log(file))

  console.log(mgr.totalSize());
  console.log(mgr.stats.length);
  await mgr.deleteToSize(25000);
  console.log(mgr.stats.length);
};

run();