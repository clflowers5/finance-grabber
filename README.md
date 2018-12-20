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
* normalize/evaluate output values to common format.
* mapping of config actions to puppeteer actions // done

## To run:

1. Populate a config: `/config/sites.json`
    * Sample config in `/config/sample.json`

2. `npm install` then `npm run build`

3. from dist folder: `node index.js --bwUsername= --bwPassword= --runInBrowser=true`

All args options:
`bwUsername` bitwarden username required
`bwPassword` bitwarden password required
`runInBrowser` true/false for headless execution
`debug` true/false, debug mode will take screenshots of various steps and are just thrown in the dist directory currently.
