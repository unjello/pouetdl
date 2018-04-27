/* eslint-disable no-unused-vars */
const run = require('../../tasks/get')

module.exports = {
  command: 'get [options]',
  desc: 'Get productions',
  builder: yargs =>
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
      }),
  handler: argv => run(argv)
}