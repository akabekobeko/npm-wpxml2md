
/**
 * Constatns for the Converter class.
 * @type {Object}
 */
export const ConverterConstants = {
  syntaxHighlighterCodes: [
    // ``` + lang parameter
    'code',

    // ```
    'plain',
    'text',

    // ```lang
    'as3',
    'actionscript3',
    'bash',
    'shell',
    'cf',
    'coldfusion',
    'c-sharp',
    'csharp',
    'cpp',
    'c',
    'css',
    'delphi',
    'pas',
    'pascal',
    'diff',
    'patch',
    'erl',
    'erlang',
    'groovy',
    'js',
    'jscript',
    'javascript',
    'java',
    'jfx',
    'javafx',
    'perl',
    'pl',
    'php',
    'ps',
    'powershell',
    'py',
    'python',
    'rails',
    'ror',
    'ruby',
    'scala',
    'sql',
    'vb',
    'vbnet',
    'xml',
    'xhtml',
    'xslt',
    'html'
  ]
};

/**
 * Conver the WordPress XML to Markdown.
 */
export default class Converter {
  /**
   * Remove the beginning lines of the indent ( space or tab ).
   *
   * @param {String} src Source text.
   *
   * @return {String} Replaced text.
   */
  static indent( src ) {
    return src.replace( /^[ \t]*(?=\S)/gm, '' );
  }

  /**
   * Convert a headers.
   * Header with the id will be in the format "# Text {#id}".
   *
   * @param {String} src Source text.
   *
   * @return {String} Replaced text.
   */
  static header( src ) {
    // Header + ID
    let dest = src.replace( /<h([0-9]).*?.id="(.*?.)">(.*?.)<\/h[0-9]>/g, ( str, $1, $2, $3 ) => {
      switch( Number( $1 ) ) {
        case 1:  return '# '     + $3 + ' {#' + $2 + '}';
        case 2:  return '## '    + $3 + ' {#' + $2 + '}';
        case 3:  return '### '   + $3 + ' {#' + $2 + '}';
        case 4:  return '#### '  + $3 + ' {#' + $2 + '}';
        case 5:  return '##### ' + $3 + ' {#' + $2 + '}';
        default: return str;
      }
    } );

    // Header
    dest = dest.replace( /<h([0-9]).*?>(.*?.)<\/h[0-9]>/g, ( str, $1, $2 ) => {
      switch( Number( $1 ) ) {
        case 1:  return '# '     + $2;
        case 2:  return '## '    + $2;
        case 3:  return '### '   + $2;
        case 4:  return '#### '  + $2;
        case 5:  return '##### ' + $2;
        default: return str;
      }
    } );

    return dest;
  }

  /**
   * Convert a links to markdown link.
   * Parentheses in the URL will be escaped to ""%28" and "%29".
   *
   * @param {String} src Source text.
   *
   * @return {String} Replaced text.
   */
  static link( src ) {
    return src.replace( /<a.*.href="(.*?.)".*?.>(.*?.)<\/a>/gm, ( str, $1, $2 ) => {
      return '[' + $2 + '](' + $1.replace( /\(/gm, '%28' ).replace( /\)/gm, '%29' ) + ')';
    } );
  }

  /**
   * Parse a WordPress shortcode.
   *
   * @param {String} src Source text.
   *
   * @return {Object} Parsed result.
   */
  static parseShortcode( text ) {
    const codes = text.split( ' ' );
    const obj   = { code: codes[ 0 ], params: {} };

    for( let i = 1, max = codes.length; i < max; ++i ) {
      const params = codes[ i ].split( '=' );
      if( params.length === 1 ) {
        obj.params[ params[ 0 ] ] = ' ';
      } else {
        obj.params[ params[ 0 ] ] = params[ 1 ].replace( /^"(.+(?="$))"$/, '$1' );
      }
    }

    return obj;
  }

  /**
   * Convert a short code of SyntaxHighlighter Evolved the code block of Markdown.
   *
   * @param {String} src Source text.
   *
   * @return {String} Replaced text.
   *
   * @see http://alexgorbatchev.com/SyntaxHighlighter/manual/brushes/
   */
  static shortcodeSyntaxHighlighterEvolved( src ) {
    const codes = ConverterConstants.syntaxHighlighterCodes;
    return src.replace( /\[([^\]]+)]([^\[]+)\[\/([^\]]+)]/igm, ( str, $1, $2 ) => {
      const obj = Converter.parseShortcode( $1 );
      if( obj.code === codes[ 0 ] ) {
        // ```
        return ( obj.params.lang ? '```' + obj.params.lang + $2 + '```' : str );
      } else if( obj.code === codes[ 1 ] || obj.code === codes[ 2 ] ) {
        // ``` + "lang" parameter
        return '```' + $2 + '```';
      }

      // ```lang
      for( let i = 3, max = codes.length; i < max; ++i ) {
        if( obj.code === codes[ i ] ) {
          return '```' + obj.code + $2 + '```';
        }
      }

      return str;
    } );
  }
}
