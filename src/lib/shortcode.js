'use strict'

/**
 * Constatns for the Converter class.
 * @type {Object}
 */
const SHCodes = [
  // ``` + lang parameter
  'code',

  // ```
  'plain',
  'text',

  // ```lang
  'as3',
  'actionscript3',
  'bash',
  'shell',
  'cf',
  'coldfusion',
  'c-sharp',
  'csharp',
  'cpp',
  'c',
  'css',
  'delphi',
  'pas',
  'pascal',
  'diff',
  'patch',
  'erl',
  'erlang',
  'groovy',
  'js',
  'jscript',
  'javascript',
  'java',
  'jfx',
  'javafx',
  'perl',
  'pl',
  'php',
  'ps',
  'powershell',
  'py',
  'python',
  'rails',
  'ror',
  'ruby',
  'scala',
  'sql',
  'vb',
  'vbnet',
  'xml',
  'xhtml',
  'xslt',
  'html'
]

/**
 * String of the Code block.
 * @type {Object}
 */
const Block = {
  BeginPlain: '\n\n```\n',
  Begin: '\n\n```',
  End: '\n```\n\n'
}

/**
 * Convert the WordPress's shotcode to Markdown.
 */
class Shortcode {
  /**
   * Convert the WordPress's shotcode to Markdown.
   *
   * @return {Promise} Promise task
   */
  static convert (text) {
    return text.replace(/\[([^\]]+)]([^[]+)\[\/([^\]]+)]/igm, (src, $1, $2) => {
      const shortcode = Shortcode.parse($1)
      if (shortcode.code === 'caption') {
        return $2
      }

      return Shortcode.convertSH(src, shortcode.code, shortcode.params, $2)
    })
  }

  /**
   * Convert a SyntaxHighlighter shortcode to Markdown.
   *
   * @param {String} src    Original text.
   * @param {String} code   Shortcode name.
   * @param {Object} params Shortcode parameters.
   * @param {String} body   Shortcode body.
   *
   * @return {String} Converted text.
   */
  static convertSH (src, code, params, body) {
    const value = Shortcode.trimLineBreak(body)
    if (code === SHCodes[ 0 ]) {
      if (params.lang) {
        return Block.Begin + params.lang + '\n' + value + Block.End
      }

      return Block.BeginPlain + value + Block.End
    } else if (code === SHCodes[1] || code === SHCodes[2]) {
      return Block.BeginPlain + value + Block.End
    }

    for (let i = 3, max = SHCodes.length; i < max; ++i) {
      if (code === SHCodes[i]) {
        return Block.Begin + code + `\n` + value + Block.End
      }
    }

    return src
  }

  /**
   * Parse a WordPress shortcode ("code param1="value1" param2="value2").
   *
   * @param {String} text shortcode text.
   *
   * @return {Object} Parsed result.
   */
  static parse (text) {
    const codes = text.split(' ')
    const obj   = { code: codes[0], params: {} }

    for (let i = 1, max = codes.length; i < max; ++i) {
      const params = codes[i].split('=')
      if (params.length === 1) {
        obj.params[params[0]] = ' '
      } else {
        obj.params[params[0]] = params[1].replace(/^"(.+(?="$))"$/, '$1')
      }
    }

    return obj
  }

  /**
   * Remove the new line beginning and end of the code block.
   *
   * @param {String} text Code block text.
   *
   * @return {Text} New text.
   */
  static trimLineBreak (text) {
    return text.replace(/^[\n]|[\n]$/g, '')
  }
}

module.exports = {
  SHCodes: SHCodes,
  Shortcode: Shortcode
}
