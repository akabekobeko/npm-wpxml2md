#!/usr/bin/env node

'use strict'

const CLI = require('./cli.js')
const WpXml2Md = require('../lib/index.js')

/**
 * Entry point of the CLI.
 *
 * @param {Array.<String>} argv   Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 *
 * @return {Promise} Promise object.
 */
function main (argv, stdout) {
  return new Promise((resolve, reject) => {
    const options = CLI.parseArgv(argv)
    if (options.help) {
      CLI.printHelp(stdout)
      return resolve()
    }

    if (options.version) {
      CLI.printVersion(stdout)
      return resolve()
    }

    if (!(options.input)) {
      return reject(new Error('"-i" or "--input" has not been specified. This parameter is required.'))
    }

    if (!(options.output)) {
      return reject(new Error('"-o" or "--output" has not been specified. This parameter is required.'))
    }

    return WpXml2Md(options.input, options.output, {
      noGFM: options.noGFM,
      noMELink: options.noMELink,
      report: options.report
    })
  })
}

main(process.argv.slice(2), process.stdout)
.then()
.catch((err) => {
  console.error(err)
})
