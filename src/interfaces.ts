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
    submit: ConfigBlock | ConfigBlock[];
  },
  retrieval: {
    balance: ConfigBlock[],
    transactions: {
      pending: TransactionBlock,
      charges: TransactionBlock,
    }
  };
}

interface ConfigBlock {
  type: string,
  elementHandle: string,
  pageNavigation?: boolean,
  reportKey?: string,
  text?: string,
}

interface TransactionBlock {
  elementHandle: string,
  dateHandle?: string,
  descriptionHandle?: string,
  amountHandle: string,
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
  TransactionBlock,
  ConfigBlock,
  Args,
}