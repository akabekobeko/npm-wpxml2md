const Fs = require('fs')
const Path = require('path')

/**
 * Check the existence of a file or folder.
 *
 * @param {String} path Path of the file or folder.
 *
 * @return {Boolean} True if exists. Otherwise false.
 */
function existsSync (path) {
  try {
    Fs.accessSync(Path.resolve(path), Fs.F_OK)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Asynchronous mkdir(2). No arguments other than a possible exception are given to the completion callback.
 * mode defaults to 0o777.
 *
 * @param {String} path Directory path.
 *
 * @return {Boolean} Success if "true".
 */
function mkdirSync (path) {
  const dir = Path.resolve(path)
  if (existsSync(dir)) {
    return true
  }

  Fs.mkdirSync(dir)
  return existsSync(dir)
}

module.exports = {
  existsSync: existsSync,
  mkdirSync: mkdirSync
}
