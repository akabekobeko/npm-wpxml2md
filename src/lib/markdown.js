import Util from './util.js';

/**
 * Convert the HTML DOM Node to Markdown text.
 * @type {Array.<MdConverter>}
 * @see https://github.com/domchristie/to-markdown/blob/master/lib/md-converters.js
 */
const MarkdownConverters = [
  // Paragraph
  {
    filter: 'p',
    replacement: ( node, content ) => {
      return '\n\n' + content + '\n\n';
    }
  },
  // Line break
  {
    filter: 'br',
    replacement: () => {
      return '  \n';
    }
  },
  // Header
  {
    filter: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
    replacement: ( node, content, options ) => {
      const level  = node.nodeName.charAt( 1 );
      let   prefix = '';
      for( let i = 0; i < level; ++i ) {
        prefix += '#';
      }

      // Inter link ( Markdown Extra )
      if( node.id && !( options.noMELink ) ) {
        return '\n\n' + prefix + ' ' + content + ' {#' + node.id + '}\n\n';
      }

      return '\n\n' + prefix + ' ' + content + '\n\n';
    }
  },
  // Line
  {
    filter: 'hr',
    replacement: () => {
      return '\n\n* * *\n\n';
    }
  },
  // Italic
  {
    filter: ['em', 'i'],
    replacement: ( node, content ) => {
      return '_' + content + '_';
    }
  },
  // Strong
  {
    filter: [ 'strong', 'b' ],
    replacement: ( node, content ) => {
      return '**' + content + '**';
    }
  },
  // Inline code
  {
    filter: ( node ) => {
      const hasSiblings = node.previousSibling || node.nextSibling;
      const isCodeBlock = ( node.parentNode.nodeName === 'PRE' && !( hasSiblings ) );

      return ( node.nodeName === 'CODE' && !( isCodeBlock ) );
    },
    replacement: ( node, content ) => {
      return '`' + content + '`';
    }
  },
  // Link
  {
    filter: ( node ) => {
      return ( node.nodeName === 'A' && node.getAttribute( 'href' ) );
    },
    replacement: ( node, content ) => {
      const titlePart = node.title ? ' "' + node.title + '"' : '';
      return '[' + content + '](' + node.getAttribute( 'href' ) + titlePart + ')';
    }
  },
  // Image
  {
    filter: 'img',
    replacement: ( node ) => {
      const alt       = node.alt || '';
      const src       = node.getAttribute( 'src' ) || '';
      const title     = node.title || '';
      const titlePart = title ? ' "' + title + '"' : '';

      return src ? '![' + alt + '](' + src + titlePart + ')' : '';
    }
  },
  // Code blocks
  {
    filter: ( node ) => {
      return node.nodeName === 'PRE' && node.firstChild.nodeName === 'CODE';
    },
    replacement: ( node ) => {
      return '\n\n    ' + node.firstChild.textContent.replace( /\n/g, '\n    ' ) + '\n\n';
    }
  },
  // Block quote
  {
    filter: 'blockquote',
    replacement: ( node, content ) => {
      let result = Util.trim( content );
      result = result.replace( /\n{3,}/g, '\n\n' );
      result = result.replace( /^/gm, '> ' );
      return '\n\n' + result + '\n\n';
    }
  },
  // List item
  {
    filter: 'li',
    replacement: ( node, content ) => {
      const text   = content.replace( /^\s+/, '' ).replace( /\n/gm, '\n    ' );
      const parent = node.parentNode;
      const index  = Util.arrayIndexOf( parent.children, node ) + 1;
      const ol     = /ol/i;
      const prefix = ol.test( parent.nodeName ) ? index + '. ' : '* ';
      return prefix + text;
    }
  },
  // List
  {
    filter: [ 'ul', 'ol' ],
    replacement: ( node ) => {
      const strings = [];
      for( let i = 0, max = node.childNodes.length; i < max; ++i ) {
        if( node.childNodes[ i ]._replacement ) {
          strings.push( node.childNodes[ i ]._replacement );
        }
      }

      const li = /li/i;
      if( li.test( node.parentNode.nodeName ) ) {
        return '\n' + strings.join( '\n' );
      }

      return '\n\n' + strings.join( '\n' ) + '\n\n';
    }
  },
  // Block element
  {
    filter: ( node ) => {
      return Util.isBlockElement( node );
    },
    replacement: ( node, content ) => {
      return '\n\n' + Util.outerHTML( node, content ) + '\n\n';
    }
  },
  // Anything else!
  {
    filter: () => {
      return true;
    },
    replacement: ( node, content ) => {
      return Util.outerHTML( node, content );
    }
  }
];

export default MarkdownConverters;
