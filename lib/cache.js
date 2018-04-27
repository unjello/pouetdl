const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const os = require('os')
const log = require('./logger')

const defaultOptions = {
  fs: Object.assign({}, fs, fse),
  log
}

module.exports = (options) => {
  const opts = Object.assign({}, defaultOptions, options)
  return {
    createCacheDir: () => {
      const dir = opts.fs.mkdtempSync(path.join(os.tmpdir(), 'pouetdl-'));
      opts.log.debug(`Created temporary directory: ${dir}`);
      return dir;
    },
  
    readCacheFile: (dir, name) => {
      const fullPath = path.join(dir, name);
      opts.log.debug(`Reading cache file: ${fullPath}`);
      return opts.fs.readFileSync(fullPath, 'utf8');
    },
  
    saveCacheFile: (dir, name, data) => {
      const fullPath = path.join(dir, name);
      opts.log.debug(`Saving cache file: ${fullPath}`);
      opts.log.trace(`Saving file contents: ${data}`);
      return opts.fs.writeFileSync(fullPath, data);
    },
  
    isFileCached: (dir, name) => {
      const fullPath = path.join(dir, name);
      opts.log.trace(`Inspecting file in cache: ${fullPath}`);
      return opts.fs.existsSync(fullPath);
    },
  
    ensureCacheExists: dir => {
      if (opts.fs.existsSync(dir) === false) {
        opts.log.debug(`Provisioning directory: ${dir}`);
        opts.fs.mkdirSync(dir);
      }
    }
  
  }
}

