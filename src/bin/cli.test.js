import assert from 'assert'
import Path from 'path'
import { ParseArgv, PrintHelp, PrintVersion, HelpText, Options } from './cli.js'
import Package from '../../package.json'

/**
 * Mock class of stdout.
 */
class StdOutMock {
  /**
   * Initialize instance.
   */
  constructor () {
    this._text = ''
  }

  /**
   * Gets the written text.
   *
   * @return {String} Text.
   */
  get text () {
    return this._text
  }

  /**
   * Write the text.
   *
   * @param {String} text Text.
   */
  write (text) {
    if (typeof text === 'string') {
      this._text = text
    }
  }
}

/** @test {CLI} */
describe('CLI', () => {
  /** @test {CLI#printHelp} */
  describe('printHelp', () => {
    it('Print', () => {
      const mock = new StdOutMock()
      PrintHelp(mock)
      assert(mock.text === HelpText)
    })
  })

  /** @test {CLI#printVersion} */
  describe('printVersion', () => {
    it('Print', () => {
      const mock = new StdOutMock()
      PrintVersion(mock)

      const expected = 'v' + Package.version + '\n'
      assert(mock.text === expected)
    })
  })

  /** @test {CLI#parseArgv} */
  describe('parseArgv', () => {
    it('Help', () => {
      let options = ParseArgv([])
      assert(options.help)

      options = ParseArgv([Options.help[0]])
      assert(options.help)

      options = ParseArgv([Options.help[1]])
      assert(options.help)
    })

    it('Version', () => {
      let options = ParseArgv([Options.version[0]])
      assert(options.version)

      options = ParseArgv([Options.version[1]])
      assert(options.version)
    })

    it('Input', () => {
      const input    = './examples/wp.xml'
      const expected = Path.resolve(input)
      let options = ParseArgv([Options.input[0], input])
      assert(options.input === expected)

      options = ParseArgv([Options.input[1], input])
      assert(options.input === expected)

      options = ParseArgv([Options.input[0]])
      assert(options.input !== expected)

      options = ParseArgv([Options.input[1], Options.help[0]])
      assert(options.input !== expected)
    })

    it('Output', () => {
      const output   = './examples'
      const expected = Path.resolve(output)
      let options = ParseArgv([Options.output[0], output])
      assert(options.output === expected)

      options = ParseArgv([Options.output[1], output])
      assert(options.output === expected)

      options = ParseArgv([Options.output[0]])
      assert(options.output !== expected)

      options = ParseArgv([Options.output[1], Options.help[0]])
      assert(options.output !== expected)
    })

    it('Modes', () => {
      let modes   = 'no-gfm'
      let options = ParseArgv([Options.modes[0], modes])
      assert(options.modes.noGFM)

      options = ParseArgv([Options.modes[1], modes])
      assert(options.modes.noGFM)

      modes   = 'no-gfm,test,no-melink'
      options = ParseArgv([Options.modes[1], modes])
      assert(options.modes.noGFM && options.modes.noMELink)

      options = ParseArgv([Options.modes[0]])
      assert(!(options.modes))

      modes   = 'metadata,test,image'
      options = ParseArgv([Options.modes[1], modes])
      assert(options.modes.withMetadata)
      assert(options.modes.withImageLinkReplace)
    })

    it('Report', () => {
      let options = ParseArgv()
      assert(!(options.report))

      options = ParseArgv([Options.report[0]])
      assert(options.report)

      options = ParseArgv([Options.report[1]])
      assert(options.report)
    })
  })
})
