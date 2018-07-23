import Path from 'path'
import WpXml2Md from '../lib/index.js'

/**
 * Help text.
 * @type {String}
 */
const HelpText = `
Usage: wpxml2md [OPTIONS]

  Convert the WordPress XML file to Markdown files.

  Options:
    -h, --help            Display this text.
    -v, --version         Display the version number.
    -i, --input           Path of the XML file exported from WordPress.
    -o, --output          Path of the output directory.
    -r, --report          Output process reports.
    --no-gfm              Disable the GitHub Flavored Markdown.
    --no-melink           Disable the Markdown Extra link on header.
    --with-metadata       Enable output article metadata.
    --with-image-download Enable download and replace link syntaxes a linked images from article.
    --with-comment        Enable comment output from article.
    --replace-link-prefix Replace the link URL prefix with the specified word, format is "target=placeholder".
                          If "--replace-link http://example.com/=/" then "http://example.com/" will be replaced with "/".

  Examples:
    $ wpxml2md -i wordpress.xml -o ./dist -r
    $ wpxml2md -i wordpress.xml -o ./dist -r --with-metadata --with-image-download --with-comment --replace-link-prefix http://akabeko.me/=/

  See also:
    https://github.com/akabekobeko/npm-wpxml2md
`

/**
 * CLI options.
 * @type {Object}
 */
const Options = {
  help: { name: '--help', shortName: '-h' },
  version: { name: '--version', shortName: '-v' },
  input: { name: '--input', shortName: '-i' },
  output: { name: '--output', shortName: '-o' },
  report: { name: '--report', shortName: '-r' },
  noGFM: { name: '--no-gfm' },
  noMELink: { name: '--no-melink' },
  withMetadata: { name: '--with-metadata' },
  withImageDownload: { name: '--with-image-download' },
  withComment: { name: '--with-comment' },
  replaceLinkPrefix: { name: '--replace-link-prefix' }
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
  return !(keys.some((key) => value === Options[key].name || value === Options[key].shortName))
}

/**
 * Parse for option value.
 *
 * @param {String[]} argv Arguments of the command line.
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
 * Parse for the link option.
 *
 * @param {String} value Option value.
 *
 * @return {Object} Replace targets.
 */
const parseReplaceLinkURL = (value) => {
  const units = value.split('=')
  if (units.length < 2) {
    return { old: '', new: '' }
  }

  return { old: units[0], new: units[1] }
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
      case Options.input.name:
      case Options.input.shortName:
        value = parseArgValue(argv, index)
        if (value) {
          options.input = Path.resolve(value)
        }
        break

      case Options.output.name:
      case Options.output.shortName:
        value = parseArgValue(argv, index)
        if (value) {
          options.output = Path.resolve(value)
        }
        break

      case Options.report.name:
      case Options.report.shortName:
        options.report = true
        break

      case Options.noGFM.name:
        options.noGFM = true
        break

      case Options.noMELink.name:
        options.noMELink = true
        break

      case Options.withMetadata.name:
        options.withMetadata = true
        break

      case Options.withImageDownload.name:
        options.withImageDownload = true
        break

      case Options.withComment.name:
        options.withComment = true
        break

      case Options.replaceLinkPrefix.name:
        value = parseArgValue(argv, index)
        if (value) {
          options.replaceLinkPrefix = parseReplaceLinkURL(value)
        }
        break

      default:
        break
    }
  })

  return options
}

/**
 * Parse for the command line arguments.
 *
 * @param {String[]} argv Arguments of the command line.
 *
 * @return {CLIOptions} Parse results.
 */
const parseOption = (argv) => {
  if (!(argv && 0 < argv.length)) {
    return { help: true }
  }

  switch (argv[0]) {
    case Options.help.name:
    case Options.help.shortName:
      return { help: true }

    case Options.version.name:
    case Options.version.shortName:
      return { version: true }

    default:
      return parseArgv(argv)
  }
}

/**
 * Print a help text.
 *
 * @param {WritableStream} stdout Standard output.
 */
const printHelp = (stdout) => {
  stdout.write(HelpText)
}

/**
 * Print a version number.
 *
 * @param {WritableStream} stdout Standard output.
 */
const printVersion = (stdout) => {
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
 * Entry point of the CLI.
 *
 * @param {String[]} argv Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 *
 * @return {Promise} Asynchronous task.
 */
const CLI = (argv, stdout) => {
  return new Promise((resolve, reject) => {
    const options = parseOption(argv)
    if (options.help) {
      printHelp(stdout)
      return resolve()
    }

    if (options.version) {
      printVersion(stdout)
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

export default CLI
