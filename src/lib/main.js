import WordPressXmlToMarkdown from './wpxml2md.js';
import Logger from './logger.js';

/**
 * Conver WordPress XML to Markdown.
 *
 * @param {String} src     Path of the WordPress XML file.
 * @param {String} dest    Path of Markdown files output directory.
 * @param {Option} options Options.
 *
 * @return {Promise} Promise object.
 */
module.exports = ( src, dest, options = {} ) => {
  return WordPressXmlToMarkdown.convert( src, dest, new Logger( options.report ), options );
};
