import { JSDOM } from 'jsdom'
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
 * Check that conversion is possible.
 *
 * @param {Node} node DOM node.
 * @param {String|String[]|Function} filter Filter.
 *
 * @return {Boolean} "true" if the conversion is possible.
 */
const canConvert = (node, filter) => {
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
 * @param {Node[]} nodes DOM nodes.
 */
const collapseWhitespace = (nodes) => {
  nodes.forEach((node) => {
    if (node.nodeType === NodeTypes.ELEMENT_NODE) {
      CollapseWhitespace(node, Util.isBlockElement)
    }
  })
}

/**
 * Flanking the whitespaces.
 *
 * @param {Node} node DOM node.
 *
 * @return {Object} whitespaces.
 */
const flankingWhitespace = (node) => {
  let leading  = ''
  let trailing = ''

  if (!(Util.isBlockElement(node))) {
    const hasLeading  = RegExps.Leading.test(node.innerHTML)
    const hasTrailing = RegExps.Trailing.test(node.innerHTML)
    if (hasLeading && !(isFlankedByWhitespace('left', node))) {
      leading = ' '
    }

    if (hasTrailing && !(isFlankedByWhitespace('right', node))) {
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
 * @return {Node[]} Nodes.
 */
const flattenNodes = (node) =>  {
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
 * @return {String} Text.
 */
const getContent = (node) => {
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
const prepareText = (text) => {
  const result = Shortcode.convert(text)

  // Escape number list
  return result.replace(/(\d+)\. /g, '$1\\. ')
}

/**
 * Check a flanked by whitespace.
 *
 * @param {String} side
 * @param {Node} node Node.
 *
 * @return {Boolean} Flanked if "true".
 */
const isFlankedByWhitespace = (side, node) => {
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
 * @param {Node} node DOM node.
 * @param {Converter[]} converters Converters.
 * @param {CLIOptions} options Options.
 */
const process = (node, converters, options) => {
  let content = getContent(node)

  // Remove blank nodes
  if (!(Util.isVoidElement(node)) && RegExps.Alphabet.test(node.nodeName) && RegExps.Space.test(content)) {
    node._replacement = ''
    return
  }

  let replacement = ''
  converters.some((converter) => {
    if (!(canConvert(node, converter.filter))) {
      return false
    }

    if (typeof converter.replacement !== 'function') {
      throw new TypeError('"replacement" needs to be a function that returns a string')
    }

    const whitespace = flankingWhitespace(node)
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

/**
 * Convert the WordPress's post to Markdown.
 * Design and implementation was in reference to the npm to-markdown.
 *
 * @param {String} post WordPress's post text.
 * @param {CLIOptions} options Options.
 *
 * @return {String} Markdown text.
 *
 * @see https://github.com/domchristie/to-markdown
 */
const Convert = (post, options) => {
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

  const body  = (new JSDOM(prepareText(post))).window.document.body
  const nodes = flattenNodes(body)
  collapseWhitespace(nodes)

  // Process through nodes in reverse (so deepest child elements are first).
  for (let i = nodes.length - 1; 0 <= i; --i) {
    process(nodes[i], converters, options)
  }

  const result = getContent(body)
  return result.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
}

export default Convert
