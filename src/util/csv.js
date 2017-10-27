import _ from 'lodash/fp';
import fs from 'fs';

import logger from './logger';

export default (array, fname) => {
  logger.info(`Saving ${array.length} productions into ${fname}`);
  const keys = Object.keys(array[0]);
  const arrayToCsv = _.flow([
    _.map(Object.values),
    _.map(_.join(', ')),
    _.join('\n')
  ]);

  const csv = _.join('\n', _.concat(_.join(', ', keys), arrayToCsv(array)));

  fs.writeFileSync(fname, csv, 'utf8');
};
