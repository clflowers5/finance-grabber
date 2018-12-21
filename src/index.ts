import puppeteer from 'puppeteer';
import { login as loginToCredentials, logout as logoutOfCredentials, } from './credentialManager';
import { writeOutputFile } from './writeOutputJson';
import config from '../config/sites.json'; // todo: read from param path.
import { Args, FinancialEntry } from './interfaces';
import parseArgs from './parseArgs';
import calculateFinancialResults from "./calculateFinancialResults";
import buildFinancialConfigExecutor from "./buildFinancialConfigExecutor";

(async () => {
  const args: Args = parseArgs();

  try {
    await loginToCredentials(args.credentials);
  } catch (err) {
    console.error('Failed to get Credentials. Continuing is futile.', err);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: !args.options.runInBrowser,
    userDataDir: args.options.userDataDir,
  });

  // Everything runs async
  const fundsPromises = config.funds.map(async (fundEntry: FinancialEntry) => {
    const financialConfigExecutor = await buildFinancialConfigExecutor(browser, fundEntry, args);
    return financialConfigExecutor.execute();
  });

  const debtsPromises = config.debts.map(async (debtEntry: FinancialEntry) => {
    const financialConfigExecutor = await buildFinancialConfigExecutor(browser, debtEntry, args);
    return financialConfigExecutor.execute();
  });

  // sigh.
  let fundsResult: any[] = [];
  let debtsResult: any[] = [];

  try {
    [fundsResult, debtsResult] = [await Promise.all(fundsPromises), await Promise.all(debtsPromises)];
  } catch (err) {
    console.error(`Unrecoverable error`, err);
    await browser.close();
    await logoutOfCredentials();
    process.exit(1);
  }

  const totalFunds = calculateFinancialResults(fundsResult);
  const totalDebts = calculateFinancialResults(debtsResult);
  const actualFunds = totalFunds - totalDebts;

  const result = {
    date: new Date().toDateString(),
    funds: Object.assign({}, ...fundsResult),
    debts: Object.assign({}, ...debtsResult),
    totalFunds: String(totalFunds),
    totalDebts: String(totalDebts),
    actualFunds: String(actualFunds),
  };

  console.log('~fin', JSON.stringify(result));

  await writeOutputFile(result);

  await browser.close();
  await logoutOfCredentials();
})();
