import Fs from 'fs';
import Path from 'path';
import XmlStream from 'xml-stream';
import Converter from './converter.js';

/**
 * Convert WordPress XML to Markdown files.
 */
export default class WordPressXmlToMarkdown {
  /**
   * Conver WordPress XML file to Markdown files.
   *
   * @param {String} src    Path of the WordPress XML file.
   * @param {String} dest   Path of Markdown files output directory.
   * @param {Logger} logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static convert( src, dest, logger ) {
    return new Promise( ( resolve, reject ) => {
      const stream = Fs.createReadStream( Path.resolve( src ) );
      const xml    = new XmlStream( stream );
      const dir    = Path.resolve( dest );

      logger.log( 'Convert WordPress XML to Markdown' );

      xml.collect( 'item' );
      xml.on( 'endElement: item', ( post ) => {
        WordPressXmlToMarkdown.convertPost( post, dir, logger );
      } );

      xml.on( 'end', () => {
        resolve();
      } );

      xml.on( 'error', ( err ) => {
        reject( err );
      } );

    } );
  }

  /**
   * Convert the post data to markdown file.
   *
   * @param {Object} post   Post data.
   * @param {String} dest   Path of Markdown file output directory.
   * @param {Logger} logger Logger.
   *
   * @return {Boolean} If successful "true", otherwise "false".
   */
  static convertPost( post, dir, logger ) {
    const date  = WordPressXmlToMarkdown.formatDate( new Date( post.pubDate ), 'YYYY/MM/DD' ).split( '/' );
    const year  = date[ 0 ];
    const month = date[ 1 ];
    const day   = date[ 2 ];

    logger.log( year + '/' + month + '/' + day + ': ' + post.title );

    const stream = WordPressXmlToMarkdown.createStream( dir, year, month, day );
    if( !( stream ) ) {
      logger.error( 'ERROR: Failed to create the stream.' );
      return false;
    }

    return true;
  }

  /**
   * Create a stream of Markdown files to be written.
   *
   * @param  {String} root  Path of the roo directory.
   * @param  {String} year  [description]
   * @param  {String} month [description]
   *
   * @return {WriteStream} If successful stream, otherwise "null".
   */
  static createStream( root, year, month, day ) {
    // root/year
    let dir  = Path.join( root, year );
    let stat = Fs.statSync( dir );
    if( !( stat && stat.isDirectory() ) ) {
      Fs.mkdirSync( dir );
      stat = Fs.statSync( dir );
      if( !( stat && stat.isDirectory() ) ) {
        return null;
      }
    }

    // root/year/month
    dir = Path.join( dir, month );
    stat = Fs.statSync( dir );
    if( !( stat && stat.isDirectory() ) ) {
      Fs.mkdirSync( dir );
      stat = Fs.statSync( dir );
      if( !( stat && stat.isDirectory() ) ) {
        return null;
      }
    }

    // root/year/month/day.md or day-X.md
    let filename = day + 'md';
    let dest     = Path.join( dir, filename );
    stat = Fs.statSync( dest );
    if( stat && stat.isFile() ) {
      // Create an unique file path ( day-1, ...day-256.md )
      dest = null;
      for( let i = 1; i < 256; ++i ) {
        filename = day + '-' + i + '.md';
        const newDest = Path.join( dir, filename );

        stat = Fs.statSync( newDest );
        if( !( stat && stat.isFile() ) ) {
          dest = newDest;
          break;
        }
      }

      if( !( dest ) ) {
        return null;
      }
    }

    return Fs.createWriteStream( dest );
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
   * Write a post data.
   *
   * @param {WriteStream} stream Stream of the markdown file.
   * @param {Object}      post   Post data.
   */
  static writePost( stream, post ) {
    stream.write( '# ' + post.title + '\n', 'utf8' );

    let text = Converter.indent( post[ 'content:encoded' ] );
    text = Converter.header( text );
    text = Converter.link( text );

    stream.write( text, 'utf8' );
  }
}
