import { Args, FinancialConfig, FinancialEntry } from "./interfaces";
import buildFinancialConfigExecutor from "./buildFinancialConfigExecutor";
import { Browser } from "puppeteer";

// currently not used, however can be useful for debugging async issues
async function executeSynchronously(browser: Browser, config: FinancialConfig, args: Args) {
  return config.funds.reduce(async (carry: any, current: FinancialEntry) => {
    const result = await carry;
    const financialConfigExecutor = await buildFinancialConfigExecutor(browser, current, args);
    result.push(await financialConfigExecutor.execute());
    return result;
  }, Promise.resolve([]));
}

export default executeSynchronously;
