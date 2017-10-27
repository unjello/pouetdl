import fetch from 'node-fetch';
import _ from 'lodash/fp';

import logger from './logger';

const pad = (n, s) => `0000000000000${n}`.substr(-s);
export const prodCachedFileNameFromId = id => `prod-${pad(id, 7)}.json`;

export function readProductionCachedInfo(cache, id) {
  const fileName = prodCachedFileNameFromId(id);

  logger.verbose(`Reading pouet production: ${id}`);
  if (cache.doesExist(fileName)) {
    logger.debug(`Retrieving data from cache: ${fileName}`);
    return JSON.parse(cache.read(fileName));
  }

  return null;
}

export default async function downloadProductionInfo(cache, id) {
  const url = `http://api.pouet.net/v1/prod?id=${id}`;

  logger.debug(`Fetching pouet production: ${id}`);
  let json = readProductionCachedInfo(cache, id);
  if (json === null) {
    logger.debug(`Downloading ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      logger.error(`Failed to download ${url}. ${res.statusText}`);
      return { error: true, msg: res.statusText };
    }

    json = await res.json();

    const fileName = prodCachedFileNameFromId(id);
    logger.debug(`Saving data in cache: ${fileName}`);
    cache.save(fileName, JSON.stringify(json));
  }

  const title = `${_.property('prod.type', json)}/${_.property(
    'prod.name',
    json
  )}`;
  logger.verbose(`Fetched production #${id}, "${title}"`);
  return json;
}
