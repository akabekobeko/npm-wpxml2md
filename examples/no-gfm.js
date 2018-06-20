const wpxml2md = require('wpxml2md')
const util = require('./util.js')

const dest = './dest'
util.mkdirSync(dest)

const modes = {
  noGFM: true,
  withMetadata: true
}

wpxml2md('wp.xml', dest, true, modes)
  .then(() => {
    console.log('Completed!!!')
  })
  .catch((err) => {
    console.error(err)
  })
