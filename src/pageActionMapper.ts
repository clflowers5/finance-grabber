import PageNavigator from './pageNavigator';
import { ConfigBlock } from './interfaces';

enum ACTIONS {
  CLICK = 'click',
  ENTER_TEXT = 'enter-text',
  READ = 'read'
}

class PageActionMapper {
  constructor(private pageNavigator: PageNavigator) {}

  public async mapAction(config: ConfigBlock): Promise<void | string> {
    switch (config.type) {
      case ACTIONS.CLICK:
        return await this.handleClick(config);
      case ACTIONS.ENTER_TEXT:
        // todo: gross ending.
        return await this.pageNavigator.enterText(
          config.elementHandle,
          config.text || ''
        );
      case ACTIONS.READ:
        return await this.pageNavigator.getTextFromElement(
          config.elementHandle
        );
      default:
        throw new Error(`Failed to map action: ${config.type}`);
    }
  }

  private async handleClick(config: ConfigBlock): Promise<void> {
    if (config.pageNavigation) {
      await Promise.all([
        this.pageNavigator.clickElement(config.elementHandle),
        this.pageNavigator.navigate()
      ]);
    } else {
      await this.pageNavigator.clickElement(config.elementHandle);
    }
  }
}

export default PageActionMapper;
export { ACTIONS };
