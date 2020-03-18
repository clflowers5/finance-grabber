import PageNavigator from "./pageNavigator";
import PageActionMapper, { ACTIONS } from "./pageActionMapper";
import { Credentials, getCredentials } from "./credentialManager";
import { ConfigBlock, FinancialEntry, FinancialResult, StepsConfig } from "./interfaces";
import normalizeAmountString from "./normalizeAmountString";

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
    try {
      const credentials = await getCredentials(this.config.passwordManagerLookupKey);
      await this.pageNavigator.goToUrl(this.config.url);
      await this.takeDebugScreenshot(`${this.config.name}-arrival.png`);
      await this.handleLogin(this.config.steps, credentials);
      await this.takeDebugScreenshot(`${this.config.name}-after-login.png`);
      result = await this.retrieveFunds(this.config.steps);
      await this.pageNavigator.close();
    } catch (err) {
      console.error(`Failed to process {${this.config.name}}`, err);
    }

    return {[this.config.name]: result}
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
    return await steps.retrieval.reduce(async (carry: any, current: ConfigBlock) => {
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

  private async takeDebugScreenshot(filename: string): Promise<void> {
    if (this.options.debug) {
      await this.pageNavigator.screenshot(filename);
    }
  }
}

export default FinancialConfigExecutor;
