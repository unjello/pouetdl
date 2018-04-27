const getParser = require('./parser');

async function cli() {
  const parser = getParser();
  parser.parse(process.argv.slice(2));
}

module.exports = cli;
