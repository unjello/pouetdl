const fs = require('fs')
const path = require('path')
const os = require('os')

const logger = require('./logger')

module.exports = {
  createCacheDir: () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pouetdl-'));
    logger.debug(`Created temporary directory: ${dir}`);
    return dir;
  },

  readCacheFile: (dir, name) => {
    const fullPath = path.join(dir, name);
    logger.debug(`Reading cache file: ${fullPath}`);
    return fs.readFileSync(fullPath, 'utf8');
  },

  saveCacheFile: (dir, name, data) => {
    const fullPath = path.join(dir, name);
    logger.debug(`Saving cache file: ${fullPath}`);
    logger.trace(`Saving file contents: ${data}`);
    return fs.writeFileSync(fullPath, data);
  },

  isFileCached: (dir, name) => {
    const fullPath = path.join(dir, name);
    logger.trace(`Inspecting file in cache: ${fullPath}`);
    return fs.existsSync(fullPath);
  },

  ensureCacheExists: dir => {
    if (fs.existsSync(dir) === false) {
      logger.debug(`Provisioning directory: ${dir}`);
      fs.mkdirSync(dir);
    }
  }
}
