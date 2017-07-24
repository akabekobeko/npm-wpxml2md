import Path from 'path'

/**
 * Help text.
 * @type {[type]}
 */
export const HelpText = `
Usage: wpxml2md [OPTIONS]

  Convert the WordPress XML file to Markdown files.

  Options:
    -h, --help    Display this text.

    -v, --version Display the version number.

    -i, --input   Path of the XML file exported from WordPress.

    -o, --output  Path of the output directory.

    -m, --modes   Specify the mode in the comma separated.
                  "no-gfm" is to disable the GitHub Flavored Markdown
                  "no-melink" is to disable the Markdown Extra link on header

    -r, --report  Display the process reports.
                  Default is disable.

  Examples:
    $ wpxml2md -i wordpress.xml -o ./dist -r
    $ wpxml2md -i wordpress.xml -o ./dist -m no-gfm,no-melink -r

  See also:
    https://github.com/akabekobeko/npm-wpxml2md
`

/**
 * CLI options.
 * @type {Object}
 */
export const Options = {
  help: [ '-h', '--help' ],
  version: [ '-v', '--version' ],
  input: [ '-i', '--input' ],
  output: [ '-o', '--output' ],
  modes: [ '-m', '--modes' ],
  report: [ '-r', '--report' ]
}

/**
 * Output modes.
 * @type {Object}
 */
export const Modes = {
  noGFM: 'no-gfm',
  noMELink: 'no-melink'
}

/**
 * Provides a command line interface.
 */
export default class CLI {
  /**
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} argv Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static parseArgv (argv) {
    if (!(argv && 0 < argv.length)) {
      return { help: true }
    }

    switch (argv[ 0 ]) {
      case Options.help[0]:
      case Options.help[1]:
        return {help: true}

      case Options.version[0]:
      case Options.version[1]:
        return {version: true}

      default:
        return CLI._parseArgv(argv)
    }
  }

  /**
   * Print a help text.
   *
   * @param {WritableStream} stdout Standard output.
   */
  static printHelp (stdout) {
    stdout.write(HelpText)
  }

  /**
   * Print a version number.
   *
   * @param {WritableStream} stdout Standard output.
   */
  static printVersion (stdout) {
    const read = (path) => {
      try {
        return require(path).version
      } catch (err) {
        return null
      }
    }

    const version = read('../package.json') || read('../../package.json')
    stdout.write('v' + version + '\n')
  }

  /**
   * Check that it is an option value.
   *
   * @param {String} value Value.
   *
   * @return {Boolean} If the option of the value "true".
   */
  static _isValue (value) {
    const keys = Object.keys(Options)
    return !(keys.some((key) => value === Options[key][0] || value === Options[key][1]))
  }

  /**
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} argv Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static _parseArgv (argv) {
    const options = {}
    let   value   = null

    argv.forEach((arg, index) => {
      switch (arg) {
        case Options.input[0]:
        case Options.input[1]:
          value = CLI._parseArgValue(argv, index)
          if (value) {
            options.input = Path.resolve(value)
          }
          break

        case Options.output[0]:
        case Options.output[1]:
          value = CLI._parseArgValue(argv, index)
          if (value) {
            options.output = Path.resolve(value)
          }
          break

        case Options.report[0]:
        case Options.report[1]:
          options.report = true
          break

        case Options.modes[0]:
        case Options.modes[1]:
          value = CLI._parseArgValue(argv, index)
          if (value) {
            const modes = CLI._parseModes(value)
            options.noGFM    = modes.noGFM
            options.noMELink = modes.noMELink
          }
          break

        default:
          break
      }
    })

    return options
  }

  /**
   * Parse for option value.
   *
   * @param {Array.<String>} argv  Arguments of the command line.
   * @param {Number}         index Index of argumens.
   *
   * @return {String} Its contents if the option value, otherwise null.
   */
  static _parseArgValue (argv, index) {
    if (!(index + 1 < argv.length)) {
      return null
    }

    const value = argv[index + 1]
    return (CLI._isValue(value) ? value : null)
  }

  /**
   * Parse for the mode option.
   *
   * @param {String} arg Option.
   *
   * @return {Object} Modes.
   */
  static _parseModes (arg) {
    const result = {}
    if (typeof arg !== 'string') {
      return result
    }

    const units  = arg.split(',')
    units.forEach((unit) => {
      switch (unit) {
        case Modes.noGFM:
          result.noGFM = true
          break

        case Modes.noMELink:
          result.noMELink = true
          break

        default:
          break
      }
    })

    return result
  }
}
