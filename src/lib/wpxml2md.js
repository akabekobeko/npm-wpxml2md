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
        return reject( new Error( 'Failed to create the root directory.' ) );
      }

      const postsDir = Path.join( dir, 'posts' );
      if( !( Util.mkdirSync( postsDir ) ) ) {
        return reject( new Error( 'Failed to create the posts directory.' ) );
      }

      const pagesDir = Path.join( dir, 'pages' );
      if( !( Util.mkdirSync( pagesDir ) ) ) {
        return reject( new Error( 'Failed to create the pages directory.' ) );
      }

      return Promise
      .resolve()
      .then( () => {
        return WordPressXmlToMarkdown.postsFromXML( data.toString() );
      } )
      .then( ( posts ) => {
        posts.forEach( ( post ) => {
          const type = post[ 'wp:post_type' ][ 0 ];
          switch( type ) {
            case 'post':
              WordPressXmlToMarkdown.convertPost( type, postsDir, post, logger, options );
              break;

            case 'page':
              WordPressXmlToMarkdown.convertPost( type, pagesDir, post, logger, options );
              break;

            default:
              break;
          }
        } );
      } );
    } );
  }

  /**
   * Convert the post data to markdown file.
   *
   * @param {String} type   Type of post ( post or page ).
   * @param {String} dir    Path of Markdown file output directory.
   * @param {Object} post   Post data.
   * @param {Logger} logger Logger.
   * @param {Option} options Options.
   *
   * @return {Promise} Promise task.
   */
  static convertPost( type, dir, post, logger, options ) {
    let date  = Util.formatDate( new Date( post.pubDate ), 'YYYY/MM/DD' );
    if( !( date ) ) {
      date = Util.formatDate( new Date( post[ 'wp:post_date' ] ), 'YYYY/MM/DD' );
      if( !( date ) ) {
        date = Util.formatDate( new Date(), 'YYYY/MM/DD' );
      }
    }

    const units = date.split( '/' );
    const year  = units[ 0 ];
    const month = units[ 1 ];
    const day   = units[ 2 ];

    logger.log( year + '/' + month + '/' + day + ' [' + type + ']: ' + post.title );

    const stream = WordPressXmlToMarkdown.createStream( dir, year, month + '-' + day + '.md' );
    if( !( stream ) ) {
      throw new Error( 'Failed to create the stream.' );
    }

    const markdown = Converter.convert( post[ 'content:encoded' ][ 0 ], options );
    stream.write( '# ' + post.title + '\n\n', 'utf8' );
    stream.write( markdown, 'utf8' );
  }

  /**
   * Create a stream of Markdown files to be written.
   *
   * @param {String} root     Path of the roo directory.
   * @param {String} year     Year.
   * @param {String} fileName File name.
   *
   * @return {WriteStream} If successful stream, otherwise "null".
   */
  static createStream( root, year, fileName ) {
    // root/year
    const dir  = Path.join( root, year );
    if( !( Util.mkdirSync( dir ) ) ) {
      return null;
    }

    // root/year/month/day.md or day-X.md
    const filePath = Util.uniquePathWithSequentialNumber( Path.join( dir, fileName ) );
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
