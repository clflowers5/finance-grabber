# Finance Grabber Thing

Only works with `BitWarden` for credential management currently.

## Glorified todo list:
* Output File creation
    * ~~Schema~~
    * Aggregate fields
        * I don't remember what this is for
    * ~~Read config for pulling values~~
* tests. eventually
* actual logging to file.
    * This would be nice to have
* ~~debug modes with screenshot gen~~
* ~~normalize/evaluate output values to common format.~~
* ~~mapping of config actions to puppeteer actions~~
* support config sites.json path via command line arg or fn param (for use by other code)
* validate entire config before running
* add option for data-dir to puppeteer so that cookies work as expected.
    * sort of done, validate this?
* floating point issues? Output files get wacky numbers without a toFixed
* Support config-driven password manager selection (only BW supported for now)
* debug by default and only hold onto screenshots for failed / exception scenarios?
    * I'm pretty much never running without the debug flag set.
* normalize dates for both execution times and transactions
  * todo: did basic implementation, need to test

## Pain Points:
* Amazon / Chase has proven to be a PITA. Even with dataDir it "doesn't recognize" the browser.
    * Successfully got around this by upping timeout time and doing 2FA on the pup browser, but is there a better longterm way?
    
## Example Output (with floating point silliness):
```json
{
  "debts": {
    "Amazon Chase": {
      "balance": "286.05",
      "pending": "92.42"
    },
    "Discover": {
      "balance": "63.47",
      "pending": "0.00"
    },
    "American Express": {
      "balance": "0.00",
      "pending": "0.00"
    }
  },
  "totalFunds": "19273.66",
  "totalDebts": "441.94000000000005",
  "actualFunds": "18831.72"
}
```

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
    * This isn't a foolproof solution, but helps.

## Tests:
There are no tests. It either works or it doesn't.
That said everything is organized pretty OO like, so you could do some DI and get tests working fairly easily.

Browser automation is inherently unreliable, so things can fail or timeout regardless of whether the tests are green.
