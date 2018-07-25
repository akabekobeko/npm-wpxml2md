// const wpxml2md = require('wpxml2md')
const wpxml2md = require('../dist/lib/')
const util = require('./util.js')

const dest = './'
util.mkdirSync(dest)

const options = {
  report: true,
  noGFM: false,
  noMELink: true,
  withMetadata: true,
  withImageDownload: true,
  withComment: true,
  replaceLinkPrefix: {
    old: 'http://akabeko.me/blog/',
    new: '/'
  }
}

wpxml2md('wp.xml', dest, options)
  .then(() => {
    console.log('Completed!!!')
  })
  .catch((err) => {
    console.error(err)
  })
