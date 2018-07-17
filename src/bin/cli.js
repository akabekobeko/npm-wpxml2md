import Path from 'path'

/**
 * Help text.
 * @type {String}
 */
const HelpText = `
Usage: wpxml2md [OPTIONS]

  Convert the WordPress XML file to Markdown files.

  Options:
    -h, --help      Display this text.

    -v, --version   Display the version number.

    -i, --input     Path of the XML file exported from WordPress.

    -o, --output    Path of the output directory.

    -r, --report    Output process reports.

    --no-gfm        Disable the GitHub Flavored Markdown.

    --no-melink     Disable the Markdown Extra link on header.

    --with-metadata Enable output article metadata.

    --with-image    Enable download and replace link syntaxes a linked images from article.

    --replace-link  Replace the link URL prefix with the specified word, format is "target=placeholder".
                    If "--replace-link http://example.com/=/" then "http://example.com/" will be replaced with "/".

  Examples:
    $ wpxml2md -i wordpress.xml -o ./dist -r
    $ wpxml2md -i wordpress.xml -o ./dist -r --with-metadata --with-image --replace-link http://akabeko.me/=/

  See also:
    https://github.com/akabekobeko/npm-wpxml2md
`

/**
 * CLI options.
 * @type {Object}
 */
export const Options = {
  help: { name: '--help', shortName: '-h' },
  version: { name: '--version', shortName: '-v' },
  input: { name: '--input', shortName: '-i' },
  output: { name: '--output', shortName: '-o' },
  report: { name: '--report', shortName: '-r' },
  noGFM: { name: '--no-gfm' },
  noMELink: { name: '--no-melink' },
  withMetadata: { name: '--with-metadata' },
  withImageLinkReplace: { name: '--with-image' },
  replaceLinkPrefix: { name: '--replace-link' }
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

      case Options.withImageLinkReplace.name:
        options.withImageLinkReplace = true
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
