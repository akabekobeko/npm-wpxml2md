/**
 * @external {WritableStream} https://nodejs.org/api/stream.html
 */

/**
 * convert the HTML element to Markdown.
 *
 * @typedef {Object} MdConverter
 * @property {String|Array|Function} filter Filter to check the HTML tags.
 * @property {Function} replacement Function to replace the DOM Node.
 */

/**
 * Modes of markdown parse and output.
 *
 * @typedef {Object} Modes
 * @property {Boolean} noGFM Disable a GitHub Flavored Markdown. Default is enable.
 * @property {Boolean} noMELink Disable a GitHub Extra link on header. Default is enable.
 * @property {Boolean} withMetadata Output article metadata in YAML format at the top of Markdown.
 * @property {Boolean} withImageLinkReplace Download the linked images from articles. The file name is the same as markdown. Multiple images become serial numbers.
 */

/**
 * Commad line options.
 *
 * @typedef {Object} CLIOptions
 * @property {Boolean} help Mode to display the help text.
 * @property {Boolean} version Mode to display the version number.
 * @property {String} input Path of the SVG file or PNG file directory.
 * @property {String} output Path of the output directory.
 * @property {Boolean} report Display the process reports. Default is disable.
 * @property {Modes} modes Modes of markdown parse and output.
 */
