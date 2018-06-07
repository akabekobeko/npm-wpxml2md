import Fs from 'fs'
import Path  from 'path'
import XmlParser  from 'xml2js'
import Util  from './util.js'
import Convert  from './converter.js'

/**
 * Create a stream of Markdown files to be written.
 *
 * @param {String} root Path of the roo directory.
 * @param {String} year Year.
 * @param {String} fileName File name.
 *
 * @return {WriteStream} If successful stream, otherwise "null".
 */
const createStream = (root, year, month, fileName) => {
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

  // root/year/month/day.md or day-X.md
  const filePath = Util.uniquePathWithSequentialNumber(Path.join(dir, fileName))
  if (!(filePath)) {
    return null
  }

  return Fs.createWriteStream(filePath)
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
 * Write an article metadata.
 *
 * @param {Object} metadata Metadata of article.
 * @param {Stream} stream Writable stream.
 */
const writeMetadata = (metadata, stream) => {
  const text =
`---
path: "/${metadata.year}/${metadata.month}/${metadata.permanentName}/"
date: "${metadata.year}-${metadata.month}-${metadata.day}T${metadata.time}Z"
title: "${metadata.title}"
categories: ${arrayToString(metadata.categories)}
tags: ${arrayToString(metadata.tags)}
`

  stream.write(text, 'utf8')

  if (metadata.type === 'page') {
    stream.write(`single: true\n`, 'utf8')
  }

  stream.write('---\n\n', 'utf8')
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

  const datetime = post['wp:post_date_gmt'][0].split(' ')
  const date     = datetime[0].split('-')

  return {
    year: date[0],
    month: date[1],
    day: date[2],
    time: datetime[1],
    permanentName: post['wp:post_name'][0],
    title: post['title'][0],
    categories,
    tags,
    type: post['wp:post_type'][0]
  }
}

/**
 * Convert the post data to markdown file.
 *
 * @param {Object} post Post data.
 * @param {Object} metadata Metadata.
 * @param {String} dir Path of Markdown file output directory.
 * @param {Logger} logger Logger.
 * @param {Option} options Options.
 *
 * @return {Promise} Promise task.
 */
const convertPost = (post, metadata, dir, logger, options) => {
  logger.log(`${metadata.year}/${metadata.month}/${metadata.day} ['${metadata.type}']: ${metadata.title}`)

  const stream = createStream(dir, metadata.year, metadata.month, `${metadata.day}.md`)
  if (!(stream)) {
    throw new Error('Failed to create the stream.')
  }

  const markdown = Convert(post['content:encoded'][0], options)
  if (options.withMetadata) {
    writeMetadata(metadata, stream)
  } else {
    stream.write(`# ${metadata.title}\n\n`, 'utf8')
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
 * @param {String} text XML text.
 *
 * @return {Promise} Promise task.
 */
const postsFromXML = (text) => {
  return new Promise((resolve, reject) => {
    XmlParser.parseString(text, (err, xml) => {
      if (err) {
        return reject(err)
      }

      if (!(xml.rss && xml.rss.channel && 0 < xml.rss.channel.length && xml.rss.channel[0].item && 0 < xml.rss.channel[0].item.length)) {
        return reject(new Error('Invalid WordPress Post XML.'))
      }

      return resolve(xml.rss.channel[0].item)
    })
  })
}

/**
 * Conver WordPress XML file to Markdown files.
 *
 * @param {String} src Path of the WordPress XML file.
 * @param {String} dest Path of Markdown files output directory.
 * @param {Logger} logger Logger.
 * @param {Option} options Options.
 *
 * @return {Promise} Promise object.
 */
const WordPressXmlToMarkdown = (src, dest, logger, options) => {
  return new Promise((resolve, reject) => {
    const data = Fs.readFileSync(Path.resolve(src))
    if (!(data)) {
      return reject(new Error(`"${src}" is not found.`))
    }

    const dir = createUniqueDestDir(dest)
    if (!(dir)) {
      return reject(new Error('Failed to create the root directory.'))
    }

    const postsDir = Path.join(dir, 'posts')
    if (!(Util.mkdirSync(postsDir))) {
      return reject(new Error('Failed to create the posts directory.'))
    }

    const pagesDir = Path.join(dir, 'pages')
    if (!(Util.mkdirSync(pagesDir))) {
      return reject(new Error('Failed to create the pages directory.'))
    }

    return Promise
      .resolve()
      .then(() => {
        return postsFromXML(data.toString())
      })
      .then((posts) => {
        posts.forEach((post) => {
          const metadata = readMetadata(post)
          convertPost(post, metadata, metadata.type === 'post' ? postsDir : pagesDir, logger, options)
        })
      })
  })
}

export default WordPressXmlToMarkdown
