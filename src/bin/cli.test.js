import assert from 'assert'
import Path from 'path'
import CLI, {HelpText, Options} from './cli.js'
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
      CLI.printHelp(mock)
      assert(mock.text === HelpText)
    })
  })

  /** @test {CLI#printVersion} */
  describe('printVersion', () => {
    it('Print', () => {
      const mock = new StdOutMock()
      CLI.printVersion(mock)

      const expected = 'v' + Package.version + '\n'
      assert(mock.text === expected)
    })
  })

  /** @test {CLI#parseArgv} */
  describe('parseArgv', () => {
    it('Help', () => {
      let options = CLI.parseArgv([])
      assert(options.help)

      options = CLI.parseArgv([ Options.help[ 0 ] ])
      assert(options.help)

      options = CLI.parseArgv([ Options.help[ 1 ] ])
      assert(options.help)
    })

    it('Version', () => {
      let options = CLI.parseArgv([ Options.version[ 0 ] ])
      assert(options.version)

      options = CLI.parseArgv([ Options.version[ 1 ] ])
      assert(options.version)
    })

    it('Input', () => {
      const input    = './examples/wp.xml'
      const expected = Path.resolve(input)
      let options = CLI.parseArgv([ Options.input[ 0 ], input ])
      assert(options.input === expected)

      options = CLI.parseArgv([ Options.input[ 1 ], input ])
      assert(options.input === expected)

      options = CLI.parseArgv([ Options.input[ 0 ] ])
      assert(options.input !== expected)

      options = CLI.parseArgv([ Options.input[ 1 ], Options.help[ 0 ] ])
      assert(options.input !== expected)
    })

    it('Output', () => {
      const output   = './examples'
      const expected = Path.resolve(output)
      let options = CLI.parseArgv([ Options.output[ 0 ], output ])
      assert(options.output === expected)

      options = CLI.parseArgv([ Options.output[ 1 ], output ])
      assert(options.output === expected)

      options = CLI.parseArgv([ Options.output[ 0 ] ])
      assert(options.output !== expected)

      options = CLI.parseArgv([ Options.output[ 1 ], Options.help[ 0 ] ])
      assert(options.output !== expected)
    })

    it('Modes', () => {
      let modes   = 'no-gfm'
      let options = CLI.parseArgv([ Options.modes[ 0 ], modes ])
      assert(options.noGFM)

      options = CLI.parseArgv([ Options.modes[ 1 ], modes ])
      assert(options.noGFM)

      modes   = 'no-gfm,test,no-melink'
      options = CLI.parseArgv([ Options.modes[ 1 ], modes ])
      assert(options.noGFM && options.noMELink)

      options = CLI.parseArgv([ Options.modes[ 0 ] ])
      assert(!(options.noGFM && options.noMELink))

      options = CLI.parseArgv([ Options.modes[ 1 ], Options.help[ 0 ] ])
      assert(!(options.noGFM && options.noMELink))
    })

    it('Report', () => {
      let options = CLI.parseArgv()
      assert(!(options.report))

      options = CLI.parseArgv([ Options.report[ 0 ] ])
      assert(options.report)

      options = CLI.parseArgv([ Options.report[ 1 ] ])
      assert(options.report)
    })
  })
})
