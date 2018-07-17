import assert from 'assert'
import Path from 'path'
import { ParseArgv, Options } from './cli.js'

/** @test {CLI} */
describe('CLI', () => {
  /** @test {CLI#parseArgv} */
  describe('parseArgv', () => {
    it('help', () => {
      let options = ParseArgv([])
      assert(options.help)

      options = ParseArgv([Options.help.name])
      assert(options.help)

      options = ParseArgv([Options.help.shortName])
      assert(options.help)
    })

    it('version', () => {
      let options = ParseArgv([Options.version.name])
      assert(options.version)

      options = ParseArgv([Options.version.shortName])
      assert(options.version)
    })

    it('input', () => {
      const input    = './examples/wp.xml'
      const expected = Path.resolve(input)
      let options = ParseArgv([Options.input.name, input])
      assert(options.input === expected)

      options = ParseArgv([Options.input.shortName, input])
      assert(options.input === expected)

      options = ParseArgv([Options.input.name])
      assert(options.input !== expected)

      options = ParseArgv([Options.input.shortName, Options.help.name])
      assert(options.input !== expected)
    })

    it('output', () => {
      const output   = './examples'
      const expected = Path.resolve(output)
      let options = ParseArgv([Options.output.name, output])
      assert(options.output === expected)

      options = ParseArgv([Options.output.shortName, output])
      assert(options.output === expected)

      options = ParseArgv([Options.output.name])
      assert(options.output !== expected)

      options = ParseArgv([Options.output.shortName, Options.help.name])
      assert(options.output !== expected)
    })

    it('report', () => {
      let options = ParseArgv([Options.report.name])
      assert(options.report === true)

      options = ParseArgv([Options.report.shortName])
      assert(options.report === true)
    })

    it('noGFM', () => {
      const options = ParseArgv([Options.noGFM.name])
      assert(options.noGFM === true)
    })

    it('noMELink', () => {
      const options = ParseArgv([Options.noMELink.name])
      assert(options.noMELink === true)
    })

    it('withMetadata', () => {
      const options = ParseArgv([Options.withMetadata.name])
      assert(options.withMetadata === true)
    })

    it('withImageLinkReplace', () => {
      const options = ParseArgv([Options.withImageLinkReplace.name])
      assert(options.withImageLinkReplace === true)
    })

    it('replaceLinkPrefix', () => {
      const options = ParseArgv([Options.replaceLinkPrefix.name, 'http://example.com/=/'])
      assert(options.replaceLinkPrefix.old === 'http://example.com/')
      assert(options.replaceLinkPrefix.new === '/')
    })
  })
})
