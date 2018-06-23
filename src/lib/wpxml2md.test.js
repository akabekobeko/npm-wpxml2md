import assert from 'assert'
import { replaceLinkURL } from './wpxml2md.js'

describe('WordPressXmlToMarkdown', () => {
  describe('replaceLinkURL', () => {
    it('"/"', () => {
      const text = 'text\n[alt](http://example.com/test/ "title")\ntext'

      const actual = replaceLinkURL(text, 'http://example.com/', '/')
      const expected = 'text\n[alt](/test/ "title")\ntext'
      assert(actual === expected)
    })
  })
})
