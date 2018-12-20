import { Page } from 'puppeteer';

class PageNavigator {
  constructor(private page: Page) {
  }

  public async navigate(): Promise<void> {
    try {
      await this.page.waitForNavigation({waitUntil: 'networkidle2'});
    } catch (err) {
      console.error('Wait for Page Navigation Failed');
      throw err;
    }
  }

  public async goToUrl(url: string): Promise<void> {
    try {
      // todo: should ideally be separated
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
      await this.page.goto(url, {waitUntil: 'networkidle2'});
    } catch (err) {
      console.error(`Goto Url Failed for url: ${url}`);
      throw err;
    }
  }

  public async enterText(selector: string, text: string): Promise<void> {
    try {
      await this.page.type(selector, text);
    } catch (err) {
      console.error(
        `Enter Text failed for: selector={${selector}} text={${text}}`
      );
      throw err;
    }
  }

  public async clickElement(selector: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {visible: true});
      const element =
        (await this.page.$(selector)) ||
        throwErrorHelper(`Failed to get Element for selector ${selector}`);
      await element.click();
    } catch (err) {
      console.error(`Click failed for selector: ${selector}`);
      throw err;
    }
  }

  public async getTextFromElement(selector: string): Promise<string> {
    try {
      await this.page.waitForSelector(selector, {visible: true});
      const element = await this.page.$(selector);
      return await this.page.evaluate(
        (element: HTMLElement) => Promise.resolve(element.textContent),
        element
      );
    } catch (err) {
      console.error(`Get contents failed for selector: ${selector}`);
      throw err;
    }
  }

  public async close(): Promise<void> {
    try {
      await this.page.close();
    } catch (err) {
      console.error(`Failed to close page.`);
      throw err;
    }
  }

  public async screenshot(filename: string): Promise<Buffer> {
    return await this.page.screenshot({path: filename, fullPage: true});
  }
}

function throwErrorHelper(err: string): never {
  throw new Error(err);
}

export default PageNavigator;
