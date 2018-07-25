import Fs from 'fs'
import Path  from 'path'
import NodeUtil from 'util'
import XmlParser  from 'xml2js'
import Util from './util.js'
import Logger from './logger.js'
import Convert from './converter.js'
import ImageLinkReplace from './image-link-replacer.js'
import Comment from './comment.js'

const ParseXML = NodeUtil.promisify(XmlParser.parseString)

/**
 * Create a directory to save the markdown file.
 *
 * @param {String} root Path of the roo directory.
 * @param {String} year Year.
 * @param {String} month Month
 *
 * @return {String} If successful it is the path of the created directory.
 */
const createSaveDir = (root, year, month) => {
  // root/year
  let dir  = Path.join(root, year)
  if (!(Util.mkdirSync(dir))) {
    return null
  }

  // root/year/month
  dir = Path.join(dir, month)
  if (!(Util.mkdirSync(dir))) {
    return null
  }

  return dir
}

/**
 * Array to string for metadata.
 *
 * @param {Array} arr Array.
 *
 * @return {String} String.
 */
const arrayToString = (arr) => {
  if (!(arr && arr.length)) {
    return '[]'
  }

  let str = `["${arr[0]}"`
  for (let i = 1, max = arr.length; i < max; ++i) {
    str += `, "${arr[i]}"`
  }

  str += ']'
  return str
}

/**
 * Create a header of article metadata.
 *
 * @param {Object} metadata Metadata of article.
 *
 * @return {String} Header text.
 */
const createMetadataHeader = (metadata) => {
  const last = metadata.type === 'page' ? 'single: true\n---\n\n' : '---\n\n'
  return `---
path: "/${metadata.type}s/${metadata.year}/${metadata.month}/${metadata.permanentName}/"
date: "${metadata.year}-${metadata.month}-${metadata.day}T${metadata.time}Z"
title: "${metadata.title}"
categories: ${arrayToString(metadata.categories)}
tags: ${arrayToString(metadata.tags)}
${last}`
}

/**
 * Read an article metadata from xml object.
 *
 * @param {Object} post XML object.
 *
 * @return {Object} Metadata.
 */
const readMetadata = (post) => {
  const categories = []
  const tags       = []
  if (post.category) {
    post.category.forEach((value) => {
      switch (value.$.domain) {
        case 'category':
          categories.push(value._)
          break

        case 'post_tag':
          tags.push(value._)
          break

        default:
          break
      }
    })
  }

  const datetime = Util.datetimeFromWpGMT(post['wp:post_date_gmt'][0])
  return {
    year: datetime.year,
    month: datetime.month,
    day: datetime.day,
    time: datetime.time,
    permanentName: post['wp:post_name'][0],
    title: post['title'][0],
    categories,
    tags,
    type: post['wp:post_type'][0]
  }
}

/**
 * Replace the link URL included in Markdown.
 *
 * @param {String} markdown Markdown text.
 * @param {String} oldPrefix Target.
 * @param {String} newPrefix String to replace.
 *
 * @return {String} Replaced string.
 */
const replaceLinkURL = (markdown, oldPrefix, newPrefix) => {
  if (!(markdown && (oldPrefix && typeof oldPrefix === 'string') && (newPrefix && typeof newPrefix === 'string'))) {
    return markdown
  }

  return markdown.replace(/\[(.*?)\]\((.*?)\)/g, (match, $1, $2) => {
    const regexp = new RegExp(Util.escapeRegExp(oldPrefix), 'g')
    const url = $2.replace(regexp, newPrefix)
    return `[${$1}](${url})`
  })
}

/**
 * Convert the post data to markdown file.
 *
 * @param {Object} post Post data.
 * @param {Object} metadata Metadata.
 * @param {String} rootDir Path of Markdown file output directory.
 * @param {Logger} logger Logger.
 * @param {CLIOptions} options Options.
 *
 * @return {Promise} Promise task.
 */
const convertPost = async (post, metadata, rootDir, logger, options) => {
  logger.log(`${metadata.year}/${metadata.month}/${metadata.day} ['${metadata.type}']: ${metadata.title}`)

  const dir = createSaveDir(rootDir, metadata.year, metadata.month)
  if (!(dir)) {
    throw new Error('Failed to create a save directory.')
  }

  // If there are multiple articles on the same day, their names will be duplicated and made unique.
  const filePath = Util.uniquePathWithSequentialNumber(Path.join(dir, `${metadata.day}.md`))
  const stream = Fs.createWriteStream(filePath)
  if (!(stream)) {
    throw new Error('Failed to create the stream.')
  }

  if (options.withMetadata) {
    stream.write(createMetadataHeader(metadata), 'utf8')
  } else {
    stream.write(`# ${metadata.title}\n\n`, 'utf8')
  }

  let markdown = Convert(post['content:encoded'][0], options)

  if (options.withImageDownload) {
    const basename = Path.basename(filePath, '.md')
    markdown = await ImageLinkReplace(markdown, dir, basename, logger)
  }

  if (options.replaceLinkPrefix) {
    markdown = replaceLinkURL(markdown, options.replaceLinkPrefix.old, options.replaceLinkPrefix.new)
  }

  if (options.withComment) {
    markdown += Comment(post['wp:comment'])
  }

  stream.write(markdown, 'utf8')
}

/**
 * Create a directory with a unique name.
 *
 * @param {String} dir Base directory path.
 *
 * @return {String} The path of the created directory. Failure is null.
 */
const createUniqueDestDir = (dir) => {
  const base = Path.resolve(dir)
  const name = Util.formatDate(new Date(), 'YYYYMMDD-hhmmss')

  let path = Path.resolve(base, name)
  if (!(Util.existsSync(path))) {
    if (Util.mkdirSync(path)) {
      return path
    }
  }

  // Add sequential number
  for (let i = 1; i <= 256; ++i) {
    path = Path.resolve(base, name + '-' + i)
    if (!(Util.existsSync(path))) {
      if (Util.mkdirSync(path)) {
        return path
      }
    }
  }

  return null
}

/**
 * Gets the posts data from XML.
 *
 * @param {String} src Path of XML file..
 *
 * @return {Promise} Promise task.
 */
const postsFromXML = async (src) => {
  const data = Fs.readFileSync(Path.resolve(src))
  if (!(data)) {
    throw new Error(`"${src}" is not found.`)
  }
  const xml   = await ParseXML(data.toString())
  return xml.rss.channel[0].item
}

/**
 * Conver WordPress XML file to Markdown files.
 *
 * @param {String} src Path of the WordPress XML file.
 * @param {String} dest Path of Markdown files output directory.
 * @param {CLIOptions} options Options.
 *
 * @return {Promise} Promise object.
 */
const WordPressXmlToMarkdown = async (src, dest, options = { report: false }) => {
  const logger = new Logger(options.report)
  logger.log(`Input:  ${src}`)
  logger.log(`Output: ${dest}`)

  const dir = createUniqueDestDir(dest)
  if (!(dir)) {
    throw new Error('Failed to create the root directory.')
  }

  const postsDir = Path.join(dir, 'posts')
  if (!(Util.mkdirSync(postsDir))) {
    throw new Error('Failed to create the posts directory.')
  }

  const pagesDir = Path.join(dir, 'pages')
  if (!(Util.mkdirSync(pagesDir))) {
    throw new Error('Failed to create the pages directory.')
  }

  const posts = await postsFromXML(src)
  for (let post of posts) {
    const m = readMetadata(post)
    await convertPost(post, m, m.type === 'post' ? postsDir : pagesDir, logger, options)
  }
}

export default WordPressXmlToMarkdown
