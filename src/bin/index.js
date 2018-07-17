#!/usr/bin/env node

import { ParseArgv, PrintHelp, PrintVersion } from './cli.js'
import WpXml2Md from '../lib/index.js'

/**
 * Entry point of the CLI.
 *
 * @param {String[]} argv Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 *
 * @return {Promise} Asynchronous task.
 */
function main (argv, stdout) {
  return new Promise((resolve, reject) => {
    const options = ParseArgv(argv)
    if (options.help) {
      PrintHelp(stdout)
      return resolve()
    }

    if (options.version) {
      PrintVersion(stdout)
      return resolve()
    }

    if (!(options.input)) {
      return reject(new Error('"-i" or "--input" has not been specified. This parameter is required.'))
    }

    if (!(options.output)) {
      return reject(new Error('"-o" or "--output" has not been specified. This parameter is required.'))
    }

    return WpXml2Md(options.input, options.output, options)
  })
}

main(process.argv.slice(2), process.stdout)
  .then()
  .catch((err) => {
    console.error(err)
  })
