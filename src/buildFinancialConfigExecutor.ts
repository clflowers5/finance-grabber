import { Args, FinancialEntry } from "./interfaces";
import FinancialConfigExecutor from "./financialConfigExecutor";
import PageNavigator from "./pageNavigator";
import PageActionMapper from "./pageActionMapper";
import { Browser } from "puppeteer";

async function buildFinancialConfigExecutor(browser: Browser, entry: FinancialEntry, args: Args): Promise<FinancialConfigExecutor> {
  const page = await browser.newPage();
  const navigator = new PageNavigator(page);
  const pageActionMapper = new PageActionMapper(navigator);
  return new FinancialConfigExecutor(entry, navigator, pageActionMapper, {debug: args.options.debug});
}

export default buildFinancialConfigExecutor;
