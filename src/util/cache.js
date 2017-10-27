import fs from 'fs';
import path from 'path';
import os from 'os';

import logger from './logger';

export function createCacheDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pouetdl-'));
  logger.debug(`Created temporary directory: ${dir}`);
  return dir;
}

export function readCacheFile(dir, name) {
  const fullPath = path.join(dir, name);
  logger.debug(`Reading cache file: ${fullPath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

export function saveCacheFile(dir, name, data) {
  const fullPath = path.join(dir, name);
  logger.debug(`Saving cache file: ${fullPath}`);
  logger.silly(`Saving file contents: ${data}`);
  return fs.writeFileSync(fullPath, data);
}

export function isFileCached(dir, name) {
  const fullPath = path.join(dir, name);
  logger.silly(`Inspecting file in cache: ${fullPath}`);
  return fs.existsSync(fullPath);
}

export function ensureCacheExists(dir) {
  if (fs.existsSync(dir) === false) {
    logger.debug(`Provisioning directory: ${dir}`);
    fs.mkdirSync(dir);
  }
}
