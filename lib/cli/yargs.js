const Yargs = require('yargs/yargs');

// the idea to split it into getYargs and getParser,
// shamelessly taken from redux-cli.
function resetYargs(yargs) {
  return yargs
    .help(false)
    .version(false)
    .exitProcess(true)
    .wrap(yargs.terminalWidth());
}

module.exports = () => resetYargs(Yargs())
