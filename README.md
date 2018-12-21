# Finance Grabber Thing

Only works with `BitWarden` for credential management currently.

## Glorified todo list:
* Output File creation
    * Schema // done
    * Aggregate fields
    * Read config for pulling values // done
* tests. eventually
* actual logging to file.
* debug modes with screenshot gen // done
* normalize/evaluate output values to common format. // done
* mapping of config actions to puppeteer actions // done
* support config sites.json path via command line arg
* validate entire config before running
* add option for data-dir to puppeteer so that cookies work as expected. // done

## To run:

1. Populate a config: `/config/sites.json`
    * Sample config in `/config/sample.json`

2. `npm install` then `npm run build`

3. from dist folder: `node index.js --bwUsername= --bwPassword= `

All args options:
* `bwUsername` bitwarden username required
* `bwPassword` bitwarden password required
* `runInBrowser` true/false for headless execution
* `debug` true/false, debug mode will take screenshots of various steps and are just thrown in the dist directory currently.
* `userDataDir` recommended: useful to use existing cookies and avoid browser verification issues. 
    * Path to your chrome (only) Profile,  ubuntu ex: `--userDataDir='/home/<your_profile>.config/google-chrome'`

## Tests:
There are no tests. It either works or it doesn't. 

Browser automation is inherently unreliable, so things can fail or timeout regardless of whether the tests are green.
