import puppeteer from 'puppeteer';
import PageNavigator from './pageNavigator';
import {
  login as loginToCredentials,
  logout as logoutOfCredentials,
} from './credentialManager';
import { writeOutputFile } from './writeOutputJson';
import PageActionMapper from './pageActionMapper';

// todo: read from param path.
import config from '../config/sites.json';
import FinancialConfigExecutor from './financialConfigExecutor';
import { FinancialEntry, Args } from './interfaces';
import parseArgs from './parseArgs';

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
  });

  // concurrent-ish
  const fundsPromises = config.funds.map(async (fundEntry: FinancialEntry) => {
    const financialConfigExecutor = await buildFinancialConfigExecutor(fundEntry);
    return financialConfigExecutor.execute();
  });

  const debtsPromises = config.debts.map(async (debtEntry: FinancialEntry) => {
    const financialConfigExecutor = await buildFinancialConfigExecutor(debtEntry);
    return financialConfigExecutor.execute();
  });

  // syncronous / blocking
  // const fundsPromises = await config.funds.reduce(async (carry: any, current: FinancialEntry) => {
  //   const result = await carry;
  //   const financialConfigExecutor = await buildFinancialConfigExecutor(current);
  //   result.push(await financialConfigExecutor.execute());
  //   return result;
  // }, Promise.resolve([]));

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

  const totalFunds = fundsResult.reduce((carry, current) => {
    Object.values(current).forEach((fundEntries: object) => {
      Object.values(fundEntries).forEach((value: string) => {
        const floatValue = Number.parseFloat(value);
        if (!isNaN(floatValue)) {
          carry += floatValue;
        }
      });
    });
    return carry;
  }, 0);

  const totalDebts = 0;
  const actualFunds = totalFunds - totalDebts;

  const result = {
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

  async function buildFinancialConfigExecutor(entry: FinancialEntry): Promise<FinancialConfigExecutor> {
    const page = await browser.newPage();
    const navigator = new PageNavigator(page);
    const pageActionMapper = new PageActionMapper(navigator);
    return new FinancialConfigExecutor(entry, navigator, pageActionMapper, {debug: args.options.debug});
  }
})();
