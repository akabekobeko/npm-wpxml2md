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
  const logger = new Logger( options.report );
  logger.log( 'Input:  ' + src );
  logger.log( 'Output: ' + dest );
  logger.log( 'Modes:  ' + ( options.noGFM ? 'no-gfm' : '' ) );

  return WordPressXmlToMarkdown.convert( src, dest, logger, options );
};
