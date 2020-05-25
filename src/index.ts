import { Browser } from "puppeteer";
import { formatISO } from 'date-fns';

import buildFinancialConfigExecutor from "./buildFinancialConfigExecutor";
import calculateFinancialResults from "./calculateFinancialResults";
import config from '../config/sites.json'; // todo: read from param path.
import configurePuppeteerBrowser from "./configurePuppeteerBrowser";
import parseArgs from './parseArgs';
import { Args, FinancialEntry } from './interfaces';
import { login as loginToCredentials, logout as logoutOfCredentials, } from './credentialManager';
import { writeOutputFile } from './writeOutputJson';

(async () => {
  const args: Args = parseArgs();

  try {
    await loginToCredentials(args.credentials);
  } catch (err) {
    console.error('Failed to get Credentials. Continuing is futile.', err);
    process.exit(1);
  }

  const browser: Browser = await configurePuppeteerBrowser(args);

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
  } finally {
    await logoutOfCredentials();
    await browser.close();
  }

  const totalFunds = calculateFinancialResults(fundsResult);
  const totalDebts = calculateFinancialResults(debtsResult);
  const actualFunds = totalFunds - totalDebts;

  const result = {
    date: formatISO(new Date()),
    funds: Object.assign({}, ...fundsResult),
    debts: Object.assign({}, ...debtsResult),
    totalFunds: totalFunds.toFixed(2),
    totalDebts: totalDebts.toFixed(2),
    actualFunds: actualFunds.toFixed(2),
  };

  console.log('~fin');

  await writeOutputFile(result);

  return result;
})();
