import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";
import {Browser} from "puppeteer";
import {Args} from "./interfaces";

async function configurePuppeteerBrowser(args: Args): Promise<Browser> {
    puppeteer.use(StealthPlugin());
    return await puppeteer.launch({
        headless: !args.options.runInBrowser,
        userDataDir: args.options.userDataDir,
        defaultViewport: {
            width: 1920,
            height: 1080,
        }
    }) as unknown as Browser; // this unknown is silly
}

export default configurePuppeteerBrowser;
