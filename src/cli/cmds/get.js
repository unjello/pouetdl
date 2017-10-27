/* eslint-disable no-unused-vars */
import run from '../../tasks/get';

exports.command = 'get [options]';
exports.desc = 'Get productions';
exports.builder = yargs =>
  yargs
    .option('as-csv', {
      describe: 'Save as CSV',
      default: true
    })
    .option('out-file', {
      alias: 'o',
      describe: 'Output file name',
      default: 'out.csv'
    })
    .option('from', {
      describe: 'ID to start from',
      default: 1
    })
    .option('to', {
      describe: 'maximum ID to fetch',
      default: -1
    });
exports.handler = argv => run(argv);
