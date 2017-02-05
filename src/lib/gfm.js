'use strict';

const Util = require( './util.js' );

/**
 * Convert the DOM node to cell text of the table.
 *
 * @param {String} content Content text.
 * @param {Node}   node    DOM node.
 *
 * @return {String} Cell text.
 */
function Cell( node, content ) {
  let index = 0;
  if( node.parentNode && node.parentNode.childNodes ) {
    index = Util.arrayIndexOf( node.parentNode.childNodes, node );
  }

  const prefix = ( index === 0 ? '| ' : ' ' );
  return prefix + content + ' |';
}

/**
 * RegExp for the higlighting.
 * @type {RegExp}
 */
const HighlightRegEx = /highlight highlight-(\S+)/;

/**
 * Convert the HTML DOM Node to GFM ( GitHub Flavored Markdown ) text.
 * @type {Array.<MdConverter>}
 * @see https://github.com/domchristie/to-markdown/blob/master/lib/gfm-converters.js
 */
const GfmConverters = [
  // Line break
  {
    filter: 'br',
    replacement: () => {
      return '\n';
    }
  },
  // Delete
  {
    filter: [ 'del', 's', 'strike' ],
    replacement: ( node, content ) => {
      return '~~' + content + '~~';
    }
  },
  // Checkbox
  {
    filter: ( node ) => {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI';
    },
    replacement: ( node ) => {
      return ( node.checked ? '[x]' : '[ ]' ) + ' ';
    }
  },
  // Table cell
  {
    filter: [ 'th', 'td' ],
    replacement: ( node, content ) => {
      return Cell( node, content );
    }
  },
  // Table row
  {
    filter: 'tr',
    replacement: ( node, content ) => {
      let   borderCells = '';
      const alignMap    = { left: ':--', right: '--:', center: ':-:' };

      if( node.parentNode.nodeName === 'THEAD' ) {
        for( let i = 0, max = node.childNodes.length; i < max; ++i ) {
          const elm    = node.childNodes[ i ];
          const align  = ( elm.attributes ? elm.attributes.align : null );
          const border = ( align ? alignMap[ align.value ] : '---' );

          if( elm._replacement ) {
            borderCells += Cell( elm, border );
          }
        }
      }

      return '\n' + content + ( borderCells ? '\n' + borderCells : '' );
    }
  },
  // Table
  {
    filter: 'table',
    replacement: ( node, content ) => {
      return '\n\n' + content + '\n\n';
    }
  },
  // Table parts
  {
    filter: [ 'thead', 'tbody', 'tfoot' ],
    replacement: ( node, content ) => {
      return content;
    }
  },
  // Fenced code blocks
  {
    filter: ( node ) => {
      return node.nodeName === 'PRE' &&
             node.firstChild &&
             node.firstChild.nodeName === 'CODE';
    },
    replacement: ( node ) => {
      return '\n\n```\n' + node.firstChild.textContent + '\n```\n\n';
    }
  },
  // Syntax-highlighted code blocks
  {
    filter: ( node ) => {
      return node.nodeName === 'PRE' &&
             node.parentNode.nodeName === 'DIV' &&
             HighlightRegEx.test( node.parentNode.className );
    },
    replacement: ( node ) => {
      const language = node.parentNode.className.match( HighlightRegEx )[ 1 ];
      return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n';
    }
  },
  // Div
  {
    filter: ( node ) => {
      return node.nodeName === 'DIV' &&
             HighlightRegEx.test( node.className );
    },
    replacement: ( node, content ) => {
      return '\n\n' + content + '\n\n';
    }
  }
];

module.exports = GfmConverters;
