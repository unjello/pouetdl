import _ from 'lodash/fp';

import downloadProductionInfo, {
  prodCachedFileNameFromId
} from '../util/production-info';
import getStats from '../util/get-stats';
import logger from '../util/logger';
import {
  createCacheDir,
  ensureCacheExists,
  isFileCached,
  readCacheFile,
  saveCacheFile
} from '../util/cache';
import saveCsv from '../util/csv';

const ensureCache = dir => {
  logger.debug(`Using cache directory: ${dir}`);
  ensureCacheExists(dir);

  return {
    doesExist: name => isFileCached(dir, name),
    read: name => readCacheFile(dir, name),
    save: (name, data) => saveCacheFile(dir, name, data)
  };
};

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function getAllProductionIds(from, to) {
  let end = to;
  if (to === -1) {
    const stats = await getStats();
    logger.debug(`Found ${stats.stats.prods_all} productions`);
    end = stats.stats.prods_all;
  }
  logger.verbose(`Using Id range ${from}-${to}`);
  return _.range(from, end + 1);
}

async function downloadProductions(ids, ms, cache, downloaded = []) {
  if (_.isEmpty(ids)) return downloaded;

  const prod = await downloadProductionInfo(cache, _.head(ids));
  downloaded.push(prod);

  await sleep(ms);
  return downloadProductions(_.drop(1, ids), ms, cache, downloaded);
}

export default async function run(argv) {
  const cacheDir = argv.cacheDir || createCacheDir();
  const cache = ensureCache(cacheDir);

  const isNotCached = id => !cache.doesExist(prodCachedFileNameFromId(id));
  const getIdsToDownload = _.flow([
    _.filter(isNotCached),
    _.tap(a => logger.debug(`Found ${a.length} productions missing in cache.`))
  ]);

  const allIds = await getAllProductionIds(argv.from, argv.to);
  const idsToDownload = getIdsToDownload(allIds);
  const idsCached = _.difference(allIds, idsToDownload);

  const downloadIds = async (ids, ms) => downloadProductions(ids, ms, cache);

  const allProductions = _.concat(
    await downloadIds(idsToDownload, 2500),
    await downloadIds(idsCached, 0)
  );

  const hasDownloadedSuccessfully = x => _.eq(_.property('success', x), true);
  const hasYoutubeLink = x =>
    !_.eq(
      _.findIndex(['type', 'youtube'], _.property('prod.downloadLinks', x)),
      -1
    );
  const extractProps = x => ({
    name: _.property('prod.name', x),
    type: _.property('prod.type', x),
    releaseDate: _.property('prod.releaseDate', x),
    party: _.property('prod.party.name', x),
    party_place: _.property('prod.party_place', x),
    party_year: _.property('prod.party_year', x),
    party_compo: _.property('prod.party_compo_name', x),
    screenshot: _.property('prod.screenshot', x),
    youtube: _.property(
      'link',
      _.find(['type', 'youtube'], _.property('prod.downloadLinks', x))
    )
  });

  const filterYoutubeProductions = _.flow([
    _.filter(x => x !== undefined),
    _.filter(hasDownloadedSuccessfully),
    _.filter(hasYoutubeLink),
    _.map(extractProps)
  ]);

  logger.debug(`Downloaded ${allProductions.length} productions total`);

  const youtubeProductions = filterYoutubeProductions(allProductions);
  logger.debug(`Productions maching filter: ${youtubeProductions.length} `);

  if (argv.asCsv === true) {
    saveCsv(youtubeProductions, argv.outFile);
  }
}
