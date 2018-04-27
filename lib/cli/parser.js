const getYargs = require('./yargs');

const usage = `Usage:
  $0 <command> [arguments] [options]
  $0 help <command>`;

// the idea to split it into getYargs and getParser,
// shamelessly taken from redux-cli.
module.exports =  (config = {}) => {
  return getYargs()
    .usage(usage)
    .commandDir('cmds')
    .demandCommand(1, 'must provide a valid command')
    .recommendCommands()
    .strict()
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .global('version', false)
    .option('verbose', { alias: 'v', default: false })
    .option('noisy', { alias: 'n', default: false })
    .option('cache-dir', {
      alias: 'c',
      describe: 'Cache directory location',
      default: ''
    })
    .option('log-file', {
      describe: 'Filename for logging output',
      default: ''
    })
    .epilogue('Documentation: https://github.com/unjello/pouetdl')
    .config(config);
}
