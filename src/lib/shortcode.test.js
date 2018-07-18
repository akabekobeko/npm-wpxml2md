import assert from 'assert'
import Rewire from 'rewire'
import ConvertShortCode from './shortcode.js'

/** @test {ConvertShortCode} */
describe('ConvertShortCode', () => {
  const Module = Rewire('./shortcode.js')

  /** @test {ConvertShortCode} */
  describe('ConvertShortCode', () => {
    it('[code]', () => {
      const text     = '[code]\nCode\n[/code]'
      const actual   = ConvertShortCode(text)
      const expected = '\n\n```\nCode\n```\n\n'
      assert(actual === expected)
    })

    it('[code lang="lang"]', () => {
      const text     = '[code lang="lang"]\nCode\n[/code]'
      const actual   = ConvertShortCode(text)
      const expected = '\n\n```lang\nCode\n```\n\n'
      assert(actual === expected)
    })

    it('[lang]', () => {
      let text = '[plain]\nCode\n[/plain]'
      let actual = ConvertShortCode(text)
      let expected = '\n\n```\nCode\n```\n\n'
      assert(actual === expected)

      text = '[text]\nCode\n[/text]'
      actual = ConvertShortCode(text)
      assert(actual === expected)

      const SHCodes = Module.__get__('SHCodes')
      for (let i = 3, max = SHCodes.length; i < max; ++i) {
        const code = SHCodes[ i ]
        text = '[' + code + ']Code[/' + code + ']'
        actual   = ConvertShortCode(text)
        expected = '\n\n```' + code + '\nCode\n```\n\n'
        assert(actual === expected)
      }
    })
  })

  /** @test {parse} */
  describe('parse', () => {
    const parse = Module.__get__('parse')

    it('parse', () => {
      const text = 'caption id="ID" align="alignright" width="300" caption="Caption"'
      const actual = parse(text)
      assert(actual.code           === 'caption')
      assert(actual.params.id      === 'ID')
      assert(actual.params.align   === 'alignright')
      assert(actual.params.width   === '300')
      assert(actual.params.caption === 'Caption')
    })
  })

  /** @test {trimLineBreak} */
  describe('trimLineBreak', () => {
    const trimLineBreak = Module.__get__('trimLineBreak')

    it('trimLineBreak', () => {
      let actual = trimLineBreak('\nText\n')
      assert(actual === 'Text')

      actual = trimLineBreak('\n\nText\n')
      assert(actual === '\nText')
    })
  })
})
