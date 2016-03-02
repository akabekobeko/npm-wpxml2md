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
module.exports = ( src, dest, options ) => {
  // Set defaults
  const opt = options || {};
  if( opt.report === undefined ) { opt.gmf = false; }
  if( opt.gmf    === undefined ) { opt.gmf = true; }

  return WordPressXmlToMarkdown.convert( src, dest, new Logger( opt.report ), opt );
};
