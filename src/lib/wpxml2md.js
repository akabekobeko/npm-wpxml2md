import Fs from 'fs';
import Path from 'path';
import XmlParser from 'xml2js';
import Util from './util.js';
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
      Fs.readFile( Path.resolve( src ), ( err, data ) => {
        if( err ) {
          return reject( err );
        }

        XmlParser.parseString( data.toString(), ( err2, xml ) => {
          if( err ) {
            return reject( err );
          }

          const posts = WordPressXmlToMarkdown.postsFromXML( xml );
          if( !( posts ) ) {
            return reject( new Error( 'XML is incorrect format.' ) );
          }

          const dir    = Path.resolve( dest );
          posts.forEach( ( post ) => {
            WordPressXmlToMarkdown.convertPost( post, dir, logger );
          } );

          resolve();
        } );
      } );
    } );
  }

  /**
   * Gets the posts data from XML.
   *
   * @param {Object} xml XML object.
   *
   * @return {Array.<Object>} Success if posts data array, otherwise null.
   */
  static postsFromXML( xml ) {
    if( !( xml.rss && xml.rss.channel && 0 < xml.rss.channel.length && xml.rss.channel[ 0 ].item && 0 < xml.rss.channel[ 0 ].item.length ) ) {
      return null;
    }

    return xml.rss.channel[ 0 ].item;
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
    const date  = Util.formatDate( new Date( post.pubDate ), 'YYYY/MM/DD' ).split( '/' );
    const year  = date[ 0 ];
    const month = date[ 1 ];
    const day   = date[ 2 ];

    logger.log( year + '/' + month + '/' + day + ': ' + post.title );

    const stream = WordPressXmlToMarkdown.createStream( dir, year, month, day );
    if( !( stream ) ) {
      logger.error( 'ERROR: Failed to create the stream.' );
      return false;
    }

    WordPressXmlToMarkdown.writePost( stream, post );
    return true;
  }

  /**
   * Create a stream of Markdown files to be written.
   *
   * @param {String} root  Path of the roo directory.
   * @param {String} year  [description]
   * @param {String} month [description]
   *
   * @return {WriteStream} If successful stream, otherwise "null".
   */
  static createStream( root, year, month, day ) {
    // root/year
    let dir  = Path.join( root, year );
    if( !( Util.mkdirSync( dir ) ) ) {
      return null;
    }

    // root/year/month
    dir = Path.join( dir, month );
    if( !( Util.mkdirSync( dir ) ) ) {
      return null;
    }

    // root/year/month/day.md or day-X.md
    const filePath = Util.uniquePathWithSequentialNumber( Path.join( dir, day + '.md' ) );
    if( !( filePath ) ) {
      return null;
    }

    return Fs.createWriteStream( filePath );
  }

  /**
   * Write a post data.
   *
   * @param {WriteStream} stream Stream of the markdown file.
   * @param {Object}      post   Post data.
   */
  static writePost( stream, post ) {
    // Add title
    stream.write( '# ' + post.title + '\n\n', 'utf8' );

    let text = Converter.indent( post[ 'content:encoded' ][ 0 ] );
    text = Converter.header( text );
    text = Converter.link( text );
    text = Converter.shortcodeSyntaxHighlighterEvolved( text );

    stream.write( text, 'utf8' );
  }
}
