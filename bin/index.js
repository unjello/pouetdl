#!/usr/bin/env node
const { prodCachedFileNameFromId, downloadProductionInfo } = require('../lib/production-info')
const getStats = require('../lib/get-stats')
const logger = require('../lib/logger')
const Cache = require('../lib/cache')
const Csv = require('../lib/csv')
const _ = require('lodash/fp')
const args = require('args')

args.option(['v', 'verbose'], 'Verbose output', [])
args.option(['c', 'cacheDir'], 'Location of cache folder', 'cache')
args.option(['f', 'from'], 'id of a production to start from', 1)
args.option(['t', 'to'], 'id of a production to finish on', Number.MAX_SAFE_INTEGER)
args.example('pouetdl', 'Fetch data with default settings')
args.example('pouetdl -vvv', 'Use super-extra verbose output')
args.example('pouetdl -v -c /tmp/cache', 'Use /tmp/cache as output folder, and verbose output level')
const opts = args.parse(process.argv) 


const ensureCache = dir => {
  logger.debug(`Using cache directory: ${dir}`);
  Cache.ensureCacheExists(dir);

  return {
    doesExist: name => Cache.isFileCached(dir, name),
    read: name =>  Cache.readCacheFile(dir, name),
    save: (name, data) =>  Cache.saveCacheFile(dir, name, data)
  };
};

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function getAllProductionIds(from, to) {
  let end = to;
  if (to === Number.MAX_SAFE_INTEGER) {
    const stats = await getStats();
    logger.debug(`Found ${stats.stats.prods_all} productions`);
    end = stats.stats.prods_all;
  }
  logger.info(`Using Id range ${from}-${end}`);
  return _.range(from, end + 1);
}

async function downloadProductions(ids, ms, cache, downloaded = []) {
  if (_.isEmpty(ids)) return downloaded;

  const prod = await downloadProductionInfo(cache, _.head(ids));
  downloaded.push(prod);

  await sleep(ms);
  return downloadProductions(_.drop(1, ids), ms, cache, downloaded);
}

const main = async (argv) => {
  const cacheDir = argv.cacheDir || Cache.createCacheDir();
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
}

main(opts)