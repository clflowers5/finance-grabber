import PageNavigator from "./pageNavigator";
import PageActionMapper, { ACTIONS } from "./pageActionMapper";
import { Credentials, getCredentials } from "./credentialManager";
import {ConfigBlock, FinancialEntry, FinancialResult, StepsConfig, TransactionBlock} from "./interfaces";
import normalizeAmountString from "./normalizeAmountString";
import {ElementHandle} from "puppeteer";

interface FinancialConfigExecutorOptions {
  debug: boolean;
}

class FinancialConfigExecutor {
  private static defaultOptions: FinancialConfigExecutorOptions = {
    debug: false,
  };

  constructor(
    private config: FinancialEntry,
    private pageNavigator: PageNavigator,
    private pageActionMapper: PageActionMapper,
    private options: FinancialConfigExecutorOptions = FinancialConfigExecutor.defaultOptions) {
  }

  public async execute(): Promise<any> {
    return this.processFunds();
  }

  private async processFunds(): Promise<FinancialResult> {
    let result: { [key: string]: string } = {};
    let transactionResult: object = {};
    try {
      const credentials = await getCredentials(this.config.passwordManagerLookupKey);
      await this.pageNavigator.goToUrl(this.config.url);
      await this.takeDebugScreenshot(`${this.config.name}-arrival.png`);
      await this.handleLogin(this.config.steps, credentials);
      await this.takeDebugScreenshot(`${this.config.name}-after-login.png`);
      result = await this.retrieveFunds(this.config.steps);
      transactionResult = await this.retrieveTransactions(this.config.steps);
      await this.pageNavigator.close();
    } catch (err) {
      console.error(`Failed to process {${this.config.name}}`, err);
    }

    const aggregateResult = { ...result, ...transactionResult };

    return {[this.config.name]: aggregateResult}
  }

  private async handleLogin(steps: StepsConfig, credentials: Credentials): Promise<any> {
    const loginConfig = steps.login;
    await this.pageActionMapper.mapAction(Object.assign({}, loginConfig.username, {text: credentials.username}));
    await this.pageActionMapper.mapAction(Object.assign({}, loginConfig.password, {text: credentials.password}));

    if (Array.isArray(loginConfig.submit)) {
      loginConfig.submit.forEach(async (config: ConfigBlock) => {
        await this.pageActionMapper.mapAction(config)
      });
    } else {
      await this.pageActionMapper.mapAction(loginConfig.submit);
    }
  }

  private async retrieveFunds(steps: StepsConfig): Promise<{ [key: string]: string }> {
    return await steps.retrieval.balance.reduce(async (carry: any, current: ConfigBlock) => {
      const result = await carry;
      await this.takeDebugScreenshot(`${this.config.name}-retrieval-${current.type}.png`);
      const output = await this.pageActionMapper.mapAction(current) || '';
      if (current.type === ACTIONS.READ && typeof current.reportKey === 'string') {
        // if we're reading, it's most likely a monetary value
        result[current.reportKey] = normalizeAmountString(output);
      }
      return result;
    }, Promise.resolve({}));
  }

  private async retrieveTransactions(steps: StepsConfig): Promise<object> {
    const transactions = steps.retrieval.transactions || {};
    const pendingConfig = transactions.pending;
    const chargeConfig = transactions.charges;
    const pendingCharges = pendingConfig ? await this.retrieveTransactionBlock(pendingConfig) : {};
    const actualCharges = chargeConfig ? await this.retrieveTransactionBlock(chargeConfig) : {};
    return {pendingCharges, actualCharges};
  }

  private async retrieveTransactionBlock(transactionBlock: TransactionBlock): Promise<{ [key: string]: string }> {
    const elements = await this.pageNavigator.getElementHandleArray(transactionBlock.elementHandle);
    return await elements.reduce(async (carry: any, current: ElementHandle) => {
      const result = await carry;
      const date = transactionBlock.dateHandle ? await this.pageNavigator.getTextFromProvidedElement(current, transactionBlock.dateHandle) : null;
      const description = transactionBlock.descriptionHandle ? await this.pageNavigator.getTextFromProvidedElement(current, transactionBlock.descriptionHandle) : null;
      const charge = await this.pageNavigator.getTextFromProvidedElement(current, transactionBlock.amountHandle);
      const normalizedCharge = normalizeAmountString(charge);
      result.push({ date, description, charge: normalizedCharge });
      return result;
    }, Promise.resolve([]));
  }

  private async takeDebugScreenshot(filename: string): Promise<void> {
    if (this.options.debug) {
      await this.pageNavigator.screenshot(filename);
    }
  }
}

export default FinancialConfigExecutor;
