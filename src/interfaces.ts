import { Credentials } from "./credentialManager";

interface FinancialConfig {
  funds: FinancialEntry[];
  debts: FinancialEntry[];
}

interface FinancialEntry {
  name: string;
  url: string;
  passwordManagerLookupKey: string;
  steps: StepsConfig;
}

interface StepsConfig {
  login: {
    username: ConfigBlock;
    password: ConfigBlock;
    submit: ConfigBlock;
  },
  retrieval: ConfigBlock[];
}

interface ConfigBlock {
  type: string,
  elementHandle: string,
  pageNavigation?: boolean,
  reportKey?: string,
  text?: string,
}

interface Args {
  credentials: Credentials,
  options: {
    debug: boolean,
    runInBrowser: boolean,
    userDataDir: string,
  }
}

interface FinancialResult {
  [name: string]: {
    [key: string]: string,
  }
}

export {
  FinancialConfig,
  FinancialEntry,
  FinancialResult,
  StepsConfig,
  ConfigBlock,
  Args,
}