/**
 * @external {WritableStream} https://nodejs.org/api/stream.html
 */

/**
 * convert the HTML element to Markdown.
 *
 * @typedef {Object} MdConverter
 * @property {String|Array|Function} filter      Filter to check the HTML tags.
 * @property {Function}              replacement Function to replace the DOM Node.
 */

 /**
  * Optional settings of this tool.
  *
  * @typedef {Object} Option
  * @property {Boolean}   gmf        Enable a GitHub Flavored Markdown. Default is disable.
  * @property {Converter} converters Extended converter collection.
  */

/**
 * Commad line options.
 *
 * @typedef {Object} CLIOptions
 * @property {Boolean} help    Mode to display the help text.
 * @property {Boolean} version Mode to display the version number.
 * @property {String}  input   Path of the SVG file or PNG file directory.
 * @property {String}  output  Path of the output directory.
 * @property {Boolean} gfm     Enable a GitHub Flavored Markdown. Default is disable.
 * @property {Boolean} report  Display the process reports. Default is disable.
 */
