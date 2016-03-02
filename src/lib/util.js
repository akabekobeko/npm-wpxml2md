import Fs from 'fs';
import Path from 'path';

/**
 * Elements of block.
 * @type {Array}
 */
const BlockElements = [
  'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
  'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

/**
 * Elements of void.
 * @type {Array.<String>}
 */
const VoidElements = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

/**
 * Provides utility function.
 */
export default class Util {
  /**
   * This method returns the first index at which a given element can be found in the array
   *
   * @param {Array}  arr Array.
   * @param {Object} obj Element to locate in the array.
   *
   * @return {Number} If the success index, otherwise -1.
   */
  static arrayIndexOf( arr, obj ) {
    return Array.prototype.indexOf.call( arr, obj );
  }

  /**
   * Check the existence of a file or folder.
   *
   * @param {String} path Path of the file or folder.
   *
   * @return {Boolean} True if exists. Otherwise false.
   */
  static existsSync( path ) {
    try {
      Fs.accessSync( Path.resolve( path ), Fs.F_OK );
      return true;
    } catch( err ) {
      return false;
    }
  }

  /**
   * Converts the value of the Date object to its equivalent string representation using the specified format.
   *
   * @param {Date}   date   Date and time. Default is current date and time.
   * @param {String} format Date and time format string. Default is "YYYY-MM-DD hh:mm:ss.SSS".
   *
   * @return {String} Formatted string.
   *
   * @see http://qiita.com/osakanafish/items/c64fe8a34e7221e811d0
   */
  static formatDate( date, format ) {
    const d = ( date   === undefined ? new Date()                : date   );
    let   f = ( format === undefined ? 'YYYY-MM-DD hh:mm:ss.SSS' : format );

    // Zero padding
    f = f.replace( /YYYY/g, d.getFullYear() );
    f = f.replace( /MM/g,   ( '0' + ( d.getMonth() + 1 ) ).slice( -2 ) );
    f = f.replace( /DD/g,   ( '0' +          d.getDate() ).slice( -2 ) );
    f = f.replace( /hh/g,   ( '0' +         d.getHours() ).slice( -2 ) );
    f = f.replace( /mm/g,   ( '0' +       d.getMinutes() ).slice( -2 ) );
    f = f.replace( /ss/g,   ( '0' +       d.getSeconds() ).slice( -2 ) );

    // Single digit
    f = f.replace( /M/g, d.getMonth() + 1 );
    f = f.replace( /D/g, d.getDate() );
    f = f.replace( /h/g, d.getHours() );
    f = f.replace( /m/g, d.getMinutes() );
    f = f.replace( /s/g, d.getSeconds() );

    if( f.match( /S/g ) ) {
      const milliSeconds = ( '00' + d.getMilliseconds() ).slice( -3 );
      for( let i = 0, max = f.match( /S/g ).length; i < max; ++i ) {
        f = f.replace( /S/, milliSeconds.substring( i, i + 1 ) );
      }
    }

    return f;
  }

  /**
   * Check the node of a block element.
   *
   * @param {Node} node Node.
   *
   * @return {Boolean} Block element if "true".
   */
  static isBlockElement( node ) {
    return BlockElements.indexOf( node.nodeName.toLowerCase() ) !== -1;
  }

  /**
   * Check the node of a void element.
   *
   * @param {Node} node Node.
   *
   * @return {Boolean} Void element if "true".
   */
  static isVoidElement( node ) {
    return VoidElements.indexOf( node.nodeName.toLowerCase() ) !== -1;
  }

  /**
   * Asynchronous mkdir(2). No arguments other than a possible exception are given to the completion callback.
   * mode defaults to 0o777.
   *
   * @param {String} path Directory path.
   *
   * @return {Boolean} Success if "true".
   */
  static mkdirSync( path ) {
    const dir = Path.resolve( path );
    if( Util.existsSync( dir ) ) {
      return true;
    }

    Fs.mkdirSync( dir );
    return Util.existsSync( dir );
  }

  /**
   * Get the HTML string of an element with its contents converted.
   *
   * @param  {Node}   node    DOM node.
   * @param  {String} content Text.
   *
   * @return {String} HTML text.
   */
  static outerHTML( node, content ) {
    const clone = node.cloneNode( false );
    if( clone.outerHTML ) {
      return clone.outerHTML.replace( '><', '>' + content + '<' );
    }

    return content;
  }

  /**
   * Remove whitespace from both sides of a string.
   *
   * @param {String} str String.
   *
   * @return {String} New string.1
   */
  static trim( str ) {
    return str.replace( /^[ \r\n\t]+|[ \r\n\t]+$/g, '' );
  }

  /**
   * If the file or folder to the same path on exists, generates a unique path that does not duplicate.
   * e.g. "./test" to "test-1", "./test.md" to "./test-1.md"
   *
   * @param  {String} path Original path.
   * @param  {Number} min  The minimum value of the sequential number. Defailt is 1.
   * @param  {Number} max  The maximum value of the sequential number. Defailt is 256.
   *
   * @return {String} Success is the unique path ( full path ), failure is null. If not duplicate returns the original path.
   */
  static uniquePathWithSequentialNumber( path, min = 1, max = 256 ) {
    const originalPath = Path.resolve( path );
    if( !( Util.existsSync( originalPath ) && typeof min === 'number' && typeof max === 'number' && 0 <= min && min < max ) ) {
      return originalPath;
    }

    const ext    = Path.extname( originalPath );
    const base   = Path.basename( originalPath, ext );
    const parent = Path.dirname( originalPath );

    for( let i = min; i <= max; ++i ) {
      const name       = base + '-' + i + ext;
      const uniquePath = Path.join( parent, name );
      if( !( Util.existsSync( uniquePath ) ) ) {
        return uniquePath;
      }
    }

    return null;
  }
}
