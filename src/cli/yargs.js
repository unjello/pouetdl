import Yargs from 'yargs/yargs';

// the idea to split it into getYargs and getParser,
// shamelessly taken from redux-cli.
export function resetYargs(yargs) {
  return yargs
    .help(false)
    .version(false)
    .exitProcess(true)
    .wrap(yargs.terminalWidth());
}

export default function getYargs() {
  return resetYargs(Yargs());
}
