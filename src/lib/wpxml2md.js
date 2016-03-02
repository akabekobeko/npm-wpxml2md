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
   * @param {String} src     Path of the WordPress XML file.
   * @param {String} dest    Path of Markdown files output directory.
   * @param {Logger} logger  Logger.
   * @param {Option} options Options.
   *
   * @return {Promise} Promise object.
   */
  static convert( src, dest, logger, options ) {
    return new Promise( ( resolve, reject ) => {
      const data = Fs.readFileSync( Path.resolve( src ) );
      if( !( data ) ) {
        return reject( new Error( '"' + src + '" is not found.' ) );
      }

      const dir = WordPressXmlToMarkdown.createUniqueDestDir( dest );
      if( !( dir ) ) {
        return reject( new Error( 'Failed to create the directory.' ) );
      }

      return Promise
      .resolve()
      .then( () => {
        return WordPressXmlToMarkdown.postsFromXML( data.toString() );
      } )
      .then( ( posts ) => {
        const tasks = posts.map( ( post ) => WordPressXmlToMarkdown.convertPost( post, dir, logger, options ) );
        return Promise.all( tasks );
      } );
    } );
  }

  /**
   * Convert the post data to markdown file.
   *
   * @param {Object} post   Post data.
   * @param {String} dir    Path of Markdown file output directory.
   * @param {Logger} logger Logger.
   * @param {Option} options Options.
   *
   * @return {Promise} Promise task.
   */
  static convertPost( post, dir, logger, options ) {
    return new Promise( ( resolve, reject ) => {
      const date  = Util.formatDate( new Date( post.pubDate ), 'YYYY/MM/DD' ).split( '/' );
      const year  = date[ 0 ];
      const month = date[ 1 ];
      const day   = date[ 2 ];

      logger.log( year + '/' + month + '/' + day + ': ' + post.title );

      const stream = WordPressXmlToMarkdown.createStream( dir, year, month, day );
      if( !( stream ) ) {
        return reject( new Error( 'Failed to create the stream.' ) );
      }

      return Converter.convert( post[ 'content:encoded' ][ 0 ], options )
      .then( ( markdown ) => {
        stream.write( '# ' + post.title + '\n\n', 'utf8' );
        stream.write( markdown, 'utf8' );
      } );
    } );
  }

  /**
   * Create a stream of Markdown files to be written.
   *
   * @param {String} root  Path of the roo directory.
   * @param {String} year  Year.
   * @param {String} month Month.
   * @param {String} day   Day.
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
   * Create a directory with a unique name.
   *
   * @param {String} dir Base directory path.
   *
   * @return {String} The path of the created directory. Failure is null.
   */
  static createUniqueDestDir( dir ) {
    const base = Path.resolve( dir );
    const name = Util.formatDate( new Date(), 'YYYYMMDD-hhmmss' );

    let path = Path.resolve( base, name );
    if( !( Util.existsSync( path ) ) ) {
      if( Util.mkdirSync( path ) ) {
        return path;
      }
    }

    // Add sequential number
    for( let i = 1; i <= 256; ++i ) {
      path = Path.resolve( base, name + '-' + i );
      if( !( Util.existsSync( path ) ) ) {
        if( Util.mkdirSync( path ) ) {
          return path;
        }
      }
    }

    return null;
  }

  /**
   * Gets the posts data from XML.
   *
   * @param {String} text XML text.
   *
   * @return {Promise} Promise task.
   */
  static postsFromXML( text ) {
    return new Promise( ( resolve, reject ) => {
      XmlParser.parseString( text, ( err, xml ) => {
        if( err ) {
          return reject( err );
        }

        if( !( xml.rss && xml.rss.channel && 0 < xml.rss.channel.length && xml.rss.channel[ 0 ].item && 0 < xml.rss.channel[ 0 ].item.length ) ) {
          return reject( new Error( 'Invalid WordPress Post XML.' ) );
        }

        return resolve( xml.rss.channel[ 0 ].item );
      } );
    } );
  }
}
