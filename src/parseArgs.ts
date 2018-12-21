import minimist from 'minimist';
import { Args } from './interfaces';

enum ArgKeys {
  USERNAME = 'bwUsername',
  PASSWORD = 'bwPassword',
  RUN_IN_BROWSER = 'runInBrowser',
  DEBUG = 'debug',
  DATA_DIR = 'userDataDir',
}

function parseArgs(): Args {
  const args: { [s: string]: any } = minimist(process.argv.slice(2));
  return {
    credentials: {
      username: String(args[ArgKeys.USERNAME]),
      password: String(args[ArgKeys.PASSWORD]),
    },
    options: {
      debug: args[ArgKeys.DEBUG] === 'true',
      runInBrowser: args[ArgKeys.RUN_IN_BROWSER] === 'true',
      userDataDir: args[ArgKeys.DATA_DIR] || null
    }
  };
}

export default parseArgs;
