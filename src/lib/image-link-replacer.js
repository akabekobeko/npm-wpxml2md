import Fs from 'fs'
import Path from 'path'
import NodeUtil from 'util'
import Request from 'request'

const RequestGet = NodeUtil.promisify(Request)

/**
 * Regular expression.of an image link.
 *
 * @type {RegExp}
 */
const REGEX_IMAGE_LINK = /(\[!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)\]\((.*?)\s*("(?:.*[^"])")?\s*\))|!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g

/**
 * Regular expression.of an image URL.
 *
 * @type {RegExp}
 */
const REGEX_IMAGE_URL = /(http)?s?:?(\/\/[^"']*?\.(?:png|jpg|jpeg|gif|png|svg))/

const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Recursively enumurate a file paths from directory.
 *
 * @param {String} dir Path of root directory.
 *
 * @return {String[]} File paths.
 */
const enumFiles = (dir) => {
  let results = []
  const items = Fs.readdirSync(dir)

  items.forEach((item) => {
    const path = Path.join(dir, item)
    const stat = Fs.statSync(path)

    if (stat.isDirectory()) {
      results = results.concat(enumFiles(path))
    } else {
      results.push(path)
    }
  })

  return results
}

/**
 * Download an images.
 *
 * @param {Object} images Image URL/Name.
 * @param {String} dir Save directory.
 * @param {Logger} logger Logger.
 *
 * @return {Promise} Asynchronous task.
 */
const downloadImages = async (images, dir, logger) => {
  const results = []
  for (let image of images) {
    logger.log(`Download: "${image.url}" => "${image.fileName}"`)

    try {
      const { error, response, body } = await RequestGet({ method: 'GET', url: image.url, encoding: null })
      if (error) {
        throw error
      } else if (response && response.statusCode !== 200) {
        throw new Error(`ERROR: status code ${response.statusCode}`)
      }

      Fs.writeFileSync(Path.join(dir, image.fileName), body, 'binary')
      results.push(image)
    } catch (err) {
      logger.error(err)
    }
  }

  return results
}

/**
 * Get image link and URL list from Markdown.
 *
 * @param {String} markdown Markdown text.
 * @param {String} basename Name on which to base the saved image file name.
 *
 * @return {Object} Link and image (URL/Saved file name) list.
 */
const parseImageLink = (markdown, basename) => {
  if (!(markdown)) {
    return { links: [], images: [] }
  }

  const urls = []
  const links = markdown.match(REGEX_IMAGE_LINK)
  if (!(links && 0 < links.length)) {
    return { links: [], images: [] }
  }

  links.forEach((link) => {
    link.replace(REGEX_IMAGE_URL, (url) => {
      urls.push(url)
    })
  })

  return {
    links,
    images: urls
      .filter((url, i, arr) => arr.indexOf(url) === i)
      .map((url, i) => {
        return {
          url,
          fileName: `${basename}-${i + 1}${Path.extname(url)}`
        }
      })
  }
}

/**
 * Replace a link syntaxes.
 *
 * @param {Object[]} images Image URL/Name.
 * @param {String[]} links Link syntaxes in markdown.
 *
 * @return {Object[]} Replaced link syntaxes.
 */
const replaceLinks = (images, links) => {
  const results = []
  for (let image of images) {
    const regexp = new RegExp(escapeRegExp(image.url), 'g')
    for (let link of links) {
      const newLink = link.replace(regexp, image.fileName)
      if (link !== newLink) {
        // Make it a replacement candidate for markdown if it is replaced
        results.push({ link, newLink })
      }
    }
  }

  return results
}

/**
 * Download the linked image from Markdown and rewrite the link.
 *
 * @param {String} markdown Markdown text.
 * @param {String} dir Directory where Markdown was output.
 * @param {String} basename Name to be the base of the image file to be saved.
 * @param {Logger} logger Logger.
 *
 * @return {Promise} Asynchronous task.
 */
const ImageLinkReplacer = async (markdown, dir, basename, logger) => {
  try {
    let data = parseImageLink(markdown, basename)
    if (data.images.length === 0) {
      return markdown
    }

    const succeededImages = await downloadImages(data.images, dir, logger)
    const targets = replaceLinks(succeededImages, data.links)

    for (let target of targets) {
      markdown = markdown.replace(target.link, target.newLink)
    }
  } catch (err) {
    logger.error(err)
  }

  return markdown
}

export default ImageLinkReplacer
