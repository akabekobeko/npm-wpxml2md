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
                  "metadata" is to enable output article metadata
                  "image" is to enable download and replace link syntaxes a linked images from article

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
  noMELink: 'no-melink',
  withMetadata: 'metadata',
  withImageLinkReplace: 'image'
}

/**
 * Check that it is an option value.
 *
 * @param {String} value Value.
 *
 * @return {Boolean} If the option of the value "true".
 */
const isValue = (value) => {
  const keys = Object.keys(Options)
  return !(keys.some((key) => value === Options[key][0] || value === Options[key][1]))
}

/**
 * Parse for option value.
 *
 * @param {String[]} argv  Arguments of the command line.
 * @param {Number} index Index of argumens.
 *
 * @return {String} Its contents if the option value, otherwise null.
 */
const parseArgValue =  (argv, index) => {
  if (!(index + 1 < argv.length)) {
    return null
  }

  const value = argv[index + 1]
  return (isValue(value) ? value : null)
}

/**
 * Parse for the mode option.
 *
 * @param {String} arg Option.
 *
 * @return {Modes} Modes.
 */
const parseModes = (arg) => {
  const result = {
    noGFM: false,
    noMELink: false,
    withMetadata: false,
    withImageLinkReplace: false
  }

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

      case Modes.withMetadata:
        result.withMetadata = true
        break

      case Modes.withImageLinkReplace:
        result.withImageLinkReplace = true
        break

      default:
        break
    }
  })

  return result
}

/**
 * Parse for the command line argumens.
 *
 * @param {String[]} argv Arguments of the command line.
 *
 * @return {CLIOptions} Parse results.
 */
const parseArgv = (argv) => {
  const options = {}
  let   value   = null

  argv.forEach((arg, index) => {
    switch (arg) {
      case Options.input[0]:
      case Options.input[1]:
        value = parseArgValue(argv, index)
        if (value) {
          options.input = Path.resolve(value)
        }
        break

      case Options.output[0]:
      case Options.output[1]:
        value = parseArgValue(argv, index)
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
        value = parseArgValue(argv, index)
        if (value) {
          options.modes = parseModes(value)
        }
        break

      default:
        break
    }
  })

  return options
}

/**
 * Parse for the command line argumens.
 *
 * @param {String[]} argv Arguments of the command line.
 *
 * @return {CLIOptions} Parse results.
 */
export const ParseArgv = (argv) => {
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
      return parseArgv(argv)
  }
}

/**
 * Print a help text.
 *
 * @param {WritableStream} stdout Standard output.
 */
export const PrintHelp = (stdout) => {
  stdout.write(HelpText)
}

/**
 * Print a version number.
 *
 * @param {WritableStream} stdout Standard output.
 */
export const PrintVersion = (stdout) => {
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
