import MD5 from 'md5'
import Util from './util.js'

/**
 * Create a Markdown image link (Gravatar) from e-mail address.
 *
 * @param {String} mail Mail e-mail address.
 *
 * @return {String} Markdown text.
 */
const createIconLink = (mail) => {
  return mail ? `![](https://www.gravatar.com/avatar/${MD5(mail)}?d=identicon) ` : ''
}

/**
 * Create a Markdown text of author.
 *
 * @param {String} author Author.
 * @param {String} url URL of author web site.
 *
 * @return {String} Markdown text.
 */
const createAuthor = (author, url) => {
  return url ? `[${author}](${url})` : author
}

/**
 * Create a datetime text.
 *
 * @param {Object} date Datetime
 *
 *
 * @return {String} Markdown text.
 */
const createDate = (date) => {
  return date ? `${date.year}-${date.month}-${date.day}T${date.time}Z` : ''
}

/**
 * Convert comments to Markdown.
 *
 * @param {Object[]} comments Comments.
 *
 * @return {String} Markdown text.
 */
const convertMarkdown = (comments) => {
  if (!(comments && 0 < comments.length)) {
    return ''
  }

  let md = ''
  for (let comment of comments) {
    md += `${createIconLink(comment.mail)}**${createAuthor(comment.author, comment.url)}** ${createDate(comment.date)}\n\n${comment.content}\n\n`
    if (comment.children) {
      md += convertMarkdown(comment.children)
    }
  }

  return md
}

/**
 * Crerate a comment tree with parent identifier.
 *
 * @param {Object[]} comments Comments.
 *
 * @return {Object[]} Parsed comments.
 */
const createCommentTree = (comments) => {
  const tree = []
  if (!(Array.isArray(comments))) {
    return tree
  }

  // Identifier mapping and deep copy
  const map = {}
  const list = []
  for (let i = 0; i < comments.length; ++i) {
    const comment = comments[i]
    map[comment.id] = i
    list.push(Object.assign({}, comment))
  }

  for (let i = 0; i < list.length; ++i) {
    const comment = list[i]
    if (comment.parent && comment.parent !== '0') {
      const parent = list[map[comment.parent]]
      if (parent.children) {
        parent.children.push(comment)
      } else {
        parent.children = [comment]
      }
    } else {
      // Root
      tree.push(comment)
    }
  }

  return tree
}

/**
 * Parse a comments..
 *
 * @param {Object[]} src Comments (wp:comment).
 *
 * @return {Object[]} Parsed comments.
 */
const parse = (src) => {
  const comments = []
  if (!(Array.isArray(src))) {
    return comments
  }

  for (let comment of src) {
    comments.push({
      id: comment['wp:comment_id'][0],
      author: comment['wp:comment_author'][0],
      mail: comment['wp:comment_author_email'][0],
      url: comment['wp:comment_author_url'][0],
      date: Util.datetimeFromWpGMT(comment['wp:comment_date_gmt'][0]),
      content: comment['wp:comment_content'][0],
      parent: comment['wp:comment_parent'][0]
    })
  }

  return comments
}

/**
 * Create a comment list.
 *
 * @param {Object[]} src Comments (wp:comment).
 *
 * @return {String} Comment list (HTML text).
 */
const Comment = (src) => {
  const comments = createCommentTree(parse(src))
  if (comments.length === 0) {
    return ''
  }

  return `\n\n## Comments\n\n${convertMarkdown(comments)}`
}

export default Comment
