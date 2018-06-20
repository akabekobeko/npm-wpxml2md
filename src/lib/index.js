import WordPressXmlToMarkdown from './wpxml2md.js'
import Logger from './logger.js'

const DefaultModes = {
  noGFM: false,
  noMELink: false,
  withMetadata: false,
  withImageLinkReplace: false
}

/**
 * Create mode setting text for report
 *
 * @param {Modes} modes Modes of markdown parse and output.
 *
 * @return {String} Text.
 */
const createModesText = (modes) => {
  const keys = Object.keys(modes)
  if (keys.length === 0) {
    return ''
  }

  const params = []
  for (let i = 0, max = keys.length; i < max; ++i) {
    if (modes[keys[i]]) {
      params.push(keys[i])
    }
  }

  return params.join(', ')
}

/**
 * Conver WordPress XML to Markdown.
 *
 * @param {String} src Path of the WordPress XML file.
 * @param {String} dest Path of Markdown files output directory.
 * @param {Boolean} withReport `true` to output the report.
 * @param {Modes} modes Modes of markdown parse and output.
 *
 * @return {Promise} Asynchronous task.
 */
module.exports = (src, dest, withReport = false, modes = DefaultModes) => {
  const logger = new Logger(withReport)
  logger.log(`Input:  ${src}`)
  logger.log(`Output: ${dest}`)
  logger.log(`Modes:  ${createModesText(modes)}`)

  return WordPressXmlToMarkdown(src, dest, modes, logger)
}
