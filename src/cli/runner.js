/**
 * CLI runner for MockAPI-Studio.
 */

const { chalk } = require('./ansi');

function parseArgs(args) {
  const parsed = {
    port: 3017,
    dbFile: null,
    delay: 0,
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if ((arg === '-p' || arg === '--port') && args[i + 1]) {
      parsed.port = parseInt(args[++i], 10);
    } else if ((arg === '-d' || arg === '--delay') && args[i + 1]) {
      parsed.delay = parseInt(args[++i], 10);
    } else if ((arg === '-f' || arg === '--file' || arg === '--db') && args[i + 1]) {
      parsed.dbFile = args[++i];
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
${chalk.bold(chalk.cyan('🚀 MockAPI-Studio Server'))} ${chalk.dim('v1.0.0')}
${chalk.dim('Zero-dependency instant REST API mock server, schema manager & Web Studio.')}

${chalk.bold('USAGE:')}
  ${chalk.green('mock-api-studio')} ${chalk.cyan('[options]')}

${chalk.bold('OPTIONS:')}
  ${chalk.cyan('-p, --port <number>')}     Port for MockAPI-Studio server (default: 3017)
  ${chalk.cyan('-f, --db <path>')}         JSON file path to load/save database (optional)
  ${chalk.cyan('-d, --delay <ms>')}        Global artificial response delay in ms (default: 0)
  ${chalk.cyan('-h, --help')}              Display help guide
  ${chalk.cyan('-v, --version')}           Display version

${chalk.bold('REST API CONVENTIONS:')}
  ${chalk.yellow('GET    /api/users')}            List all users (supports ?q= & ?_page=1&_limit=10)
  ${chalk.yellow('GET    /api/users/1')}          Get single user
  ${chalk.yellow('POST   /api/users')}            Create new user item
  ${chalk.yellow('PUT    /api/users/1')}          Update user item
  ${chalk.yellow('DELETE /api/users/1')}          Delete user item

${chalk.bold('EXAMPLES:')}
  $ mock-api-studio --port 3017
  $ mock-api-studio --db ./my-db.json --delay 200
`);
}

async function execute(args = process.argv.slice(2)) {
  const options = parseArgs(args);

  if (options.version) {
    const pkg = require('../../package.json');
    console.log(`mock-api-studio v${pkg.version}`);
    return 0;
  }

  if (options.help) {
    printHelp();
    return 0;
  }

  const { startServer } = require('../server/server');
  startServer(options.port, options);
}

module.exports = {
  execute,
  parseArgs
};
