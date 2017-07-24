import {JSDOM} from 'jsdom'
import CollapseWhitespace from 'collapse-whitespace'
import Util from './util.js'
import Shortcode from './shortcode.js'
import MarkdownConverters from './markdown.js'
import GfmConverters from './gfm.js'

/**
 * Types of node.
 * @type {Object}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 */
const NodeTypes = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3
}

/**
 * RegExp.
 * @type {Object}
 */
const RegExps = {
  Alphabet: /A/,
  Space: /^\s*$/i,
  Leading: /^[ \r\n\t]/,
  Trailing: /[ \r\n\t]$/
}

/**
 * Convert the WordPress's post to Markdown.
 * Design and implementation was in reference to the npm to-markdown.
 *
 * @see https://github.com/domchristie/to-markdown
 */
export default class Converter {
  /**
   * Check that conversion is possible.
   *
   * @param {Node} node                      DOM node.
   * @param {String|Array.<String>|Function} filter Filter.
   *
   * @return {Boolean} "true" if the conversion is possible.
   */
  static canConvert (node, filter) {
    if (typeof filter === 'string') {
      return (filter === node.nodeName.toLowerCase())
    }

    if (Array.isArray(filter)) {
      return (filter.indexOf(node.nodeName.toLowerCase()) !== -1)
    } else if (typeof filter === 'function') {
      return filter(node)
    }

    throw new TypeError('"filter" needs to be a string, array, or function')
  }

  /**
   * Collapse the whitespace from ELEMENT_NODE node.
   * TEXT_NODE will keep the original indentation and whitespace.
   *
   * @param {Array.<Node>} nodes DOM nodes.
   */
  static collapseWhitespace (nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === NodeTypes.ELEMENT_NODE) {
        CollapseWhitespace(node, Util.isBlockElement)
      }
    })
  }

  /**
   * Convert the WordPress's post to Markdown.
   *
   * @param {String}     post    WordPress's post text.
   * @param {CLIOptions} options Options.
   *
   * @return {String} Markdown text.
   */
  static convert (post, options) {
    if (!(options)) {
      options = {}
    }

    if (typeof post !== 'string') {
      throw new TypeError('"post" is not a string.')
    }

    let converters = MarkdownConverters.slice(0)
    if (!(options.noGFM)) {
      converters = GfmConverters.concat(converters)
    }

    if (options.converters) {
      converters = options.converters.concat(converters)
    }

    const body  = (new JSDOM(Converter.prepareText(post))).window.document.body
    const nodes = Converter.flattenNodes(body)
    Converter.collapseWhitespace(nodes)

    // Process through nodes in reverse (so deepest child elements are first).
    for (let i = nodes.length - 1; 0 <= i; --i) {
      Converter.process(nodes[i], converters, options)
    }

    const result = Converter.getContent(body)
    return result.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
      .replace(/\n\s+\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
  }

  /**
   * Flanking the whitespaces.
   *
   * @param {Node} node DOM node.
   *
   * @return {Object} whitespaces.
   */
  static flankingWhitespace (node) {
    let leading  = ''
    let trailing = ''

    if (!(Util.isBlockElement(node))) {
      const hasLeading  = RegExps.Leading.test(node.innerHTML)
      const hasTrailing = RegExps.Trailing.test(node.innerHTML)
      if (hasLeading && !(Converter.isFlankedByWhitespace('left', node))) {
        leading = ' '
      }

      if (hasTrailing && !(Converter.isFlankedByWhitespace('right', node))) {
        trailing = ' '
      }
    }

    return { leading: leading, trailing: trailing }
  }

  /**
   * Flattens the tree structure of nodes.
   *
   * @param {Node} node DOM node.
   *
   * @return {Array.<Node>} Nodes.
   */
  static flattenNodes (node) {
    const inqueue  = [node]
    const outqueue = []

    while (0 < inqueue.length) {
      const elm = inqueue.shift()
      outqueue.push(elm)

      for (let i = 0, max = elm.childNodes.length; i < max; ++i) {
        const child = elm.childNodes[i]
        if (child.nodeType === NodeTypes.ELEMENT_NODE) {
          inqueue.push(child)
        }
      }
    }

    // Remove root
    outqueue.shift()

    return outqueue
  }

  /**
   * Get a child contents text.
   *
   * @param {Node} node DOM node.
   *
   * @return {Text} Text.
   */
  static getContent (node) {
    let text = ''
    for (let i = 0, max = node.childNodes.length; i < max; ++i) {
      const elm = node.childNodes[i]
      if (elm.nodeType === NodeTypes.ELEMENT_NODE) {
        text += node.childNodes[i]._replacement
      } else if (elm.nodeType === NodeTypes.TEXT_NODE) {
        text += elm.data
      }
    }

    return text
  }

  /**
   * Prepare the text for parse the jsdom.
   *
   * @param {String} text Text.
   *
   * @return {String} Prepared text.
   */
  static prepareText (text) {
    const result = Shortcode.convert(text)

    // Escape number list
    return result.replace(/(\d+)\. /g, '$1\\. ')
  }

  /**
   * Check a flanked by whitespace.
   *
   * @param {String} side
   * @param {Node}   node Node.
   *
   * @return {Boolean} Flanked if "true".
   */
  static isFlankedByWhitespace (side, node) {
    let sibling = null
    let regexp  = null
    if (side === 'left') {
      sibling = node.previousSibling
      regexp  = / $/
    } else {
      sibling = node.nextSibling
      regexp  = /^ /
    }

    let isFlanked = false
    if (sibling) {
      if (sibling.nodeType === NodeTypes.TEXT_NODE) {
        isFlanked = regexp.test(sibling.nodeValue)
      } else if (sibling.nodeType === NodeTypes.ELEMENT_NODE && !(Util.isBlockElement(sibling))) {
        isFlanked = regexp.test(sibling.textContent)
      }
    }

    return isFlanked
  }

  /**
   * Convert the Node to Markdown text.
   *
   * @param {Node}              node       DOM node.
   * @param {Array.<Converter>} converters Converters.
   * @param {CLIOptions}        options    Options.
   */
  static process (node, converters, options) {
    let content = Converter.getContent(node)

    // Remove blank nodes
    if (!(Util.isVoidElement(node)) && RegExps.Alphabet.test(node.nodeName) && RegExps.Space.test(content)) {
      node._replacement = ''
      return
    }

    let replacement = ''
    converters.some((converter) => {
      if (!(Converter.canConvert(node, converter.filter))) {
        return false
      }

      if (typeof converter.replacement !== 'function') {
        throw new TypeError('"replacement" needs to be a function that returns a string')
      }

      const whitespace = Converter.flankingWhitespace(node)
      if (whitespace.leading || whitespace.trailing) {
        content = Util.trim(content)
      }

      replacement = whitespace.leading +
                    converter.replacement(node, content, options) +
                    whitespace.trailing

      return true
    })

    node._replacement = replacement
  }
}
