import WordPressXmlToMarkdown from './wpxml2md.js'
import Logger from './logger.js'

/**
 * Conver WordPress XML to Markdown.
 *
 * @param {String} src Path of the WordPress XML file.
 * @param {String} dest Path of Markdown files output directory.
 * @param {CLIOptions} options Options.
 *
 * @return {Promise} Asynchronous task.
 */
module.exports = (src, dest, options = { report: false }) => {
  const logger = new Logger(options.report)
  logger.log(`Input:  ${src}`)
  logger.log(`Output: ${dest}`)

  return WordPressXmlToMarkdown(src, dest, logger, options)
}
