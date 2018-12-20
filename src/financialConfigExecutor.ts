import PageNavigator from "./pageNavigator";
import PageActionMapper, { ACTIONS } from "./pageActionMapper";
import { Credentials, getCredentials } from "./credentialManager";
import { ConfigBlock, FinancialEntry, StepsConfig } from "./interfaces";

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
    // todo: debts, aggregate
    return this.processFunds();
  }

  private async processFunds(): Promise<any> {
    let result: string;
    try {
      const credentials = await getCredentials(this.config.passwordManagerLookupKey);
      await this.pageNavigator.goToUrl(this.config.url);
      await this.takeDebugScreenshot(`${this.config.name}-arrival.png`);
      await this.handleLogin(this.config.steps, credentials);
      await this.takeDebugScreenshot(`${this.config.name}-after-login.png`);
      result = await this.retrieveFunds(this.config.steps);
      await this.pageNavigator.close();
    } catch (err) {
      console.error(`Failed to process {${this.config.name}}`);
      result = 'error';
    }

    return {[this.config.name]: result}
  }

  private async handleLogin(steps: StepsConfig, credentials: Credentials): Promise<any> {
    const loginConfig = steps.login;
    await this.pageActionMapper.mapAction(Object.assign({}, loginConfig.username, {text: credentials.username}));
    await this.pageActionMapper.mapAction(Object.assign({}, loginConfig.password, {text: credentials.password}));
    await this.pageActionMapper.mapAction(loginConfig.submit);
  }

  private async retrieveFunds(steps: StepsConfig): Promise<any> {
    return await steps.retrieval.reduce(async (carry: any, current: ConfigBlock) => {
      const result = await carry;
      await this.takeDebugScreenshot(`${this.config.name}-retrieval-${current.type}.png`);
      const output = await this.pageActionMapper.mapAction(current);
      if (current.type === ACTIONS.READ && typeof current.reportKey === 'string') {
        result[current.reportKey] = output;
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
