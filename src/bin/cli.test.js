import assert from 'assert'
import Path from 'path'
import Rewire from 'rewire'

/** @test {CLI} */
describe('CLI', () => {
  const Module = Rewire('./cli.js')

  /** @test {CLI#parseArgv} */
  describe('parseArgv', () => {
    const parseArgv = Module.__get__('parseArgv')
    const Options = Module.__get__('Options')

    it('input', () => {
      const input    = './examples/wp.xml'
      const expected = Path.resolve(input)
      let options = parseArgv([Options.input.name, input])
      assert(options.input === expected)

      options = parseArgv([Options.input.shortName, input])
      assert(options.input === expected)

      options = parseArgv([Options.input.name])
      assert(options.input !== expected)

      options = parseArgv([Options.input.shortName, Options.help.name])
      assert(options.input !== expected)
    })

    it('output', () => {
      const output = './examples'
      const expected = Path.resolve(output)
      let options = parseArgv([Options.output.name, output])
      assert(options.output === expected)

      options = parseArgv([Options.output.shortName, output])
      assert(options.output === expected)

      options = parseArgv([Options.output.name])
      assert(options.output !== expected)

      options = parseArgv([Options.output.shortName, Options.help.name])
      assert(options.output !== expected)
    })

    it('report', () => {
      let options = parseArgv([Options.report.name])
      assert(options.report === true)

      options = parseArgv([Options.report.shortName])
      assert(options.report === true)
    })

    it('noGFM', () => {
      const options = parseArgv([Options.noGFM.name])
      assert(options.noGFM === true)
    })

    it('noMELink', () => {
      const options = parseArgv([Options.noMELink.name])
      assert(options.noMELink === true)
    })

    it('withMetadata', () => {
      const options = parseArgv([Options.withMetadata.name])
      assert(options.withMetadata === true)
    })

    it('withImageDownload', () => {
      const options = parseArgv([Options.withImageDownload.name])
      assert(options.withImageDownload === true)
    })

    it('withComment', () => {
      const options = parseArgv([Options.withComment.name])
      assert(options.withComment === true)
    })

    it('replaceLinkPrefix', () => {
      const options = parseArgv([Options.replaceLinkPrefix.name, 'http://example.com/=/'])
      assert(options.replaceLinkPrefix.old === 'http://example.com/')
      assert(options.replaceLinkPrefix.new === '/')
    })
  })
})
