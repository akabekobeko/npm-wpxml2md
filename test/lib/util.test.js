'use strict'

const assert = require('assert')
const Path = require('path')
const Util = require('../../src/lib/util.js')

/** @test {Util} */
describe('Util', () => {
  /** @test {Util#existsSync} */
  describe('existsSync', () => {
    it('Exists', () => {
      assert(Util.existsSync('./test'))
    })

    it('Not exists', () => {
      assert(!(Util.existsSync('./XXX')))
    })
  })

  /** @test {Util#formatDate} */
  describe('formatDate', () => {
    it('Default YYYY-MM-DD hh:mm:ss.SSS', () => {
      const date = new Date(2015, 7, 4, 21, 17, 45, 512)
      const text = Util.formatDate(date)
      assert(text === '2015-08-04 21:17:45.512')
    })

    it('Hyphen YYYY-MM-DD-hh-mm-ss', () => {
      const date = new Date(2015, 7, 4, 21, 17, 45, 512)
      const text = Util.formatDate(date, 'YYYY-MM-DD-hh-mm-ss')
      assert(text === '2015-08-04-21-17-45')
    })

    it('No zero-padding YYYY/M/D h:m:s', () => {
      const date = new Date(2015, 7, 4, 21, 17, 45, 512)
      const text = Util.formatDate(date, 'YYYY/M/D h:m:s')
      assert(text === '2015/8/4 21:17:45')
    })

    it('NaN', () => {
      const date = new Date('Wed, 30 Nov -0001 00:00:00 +0000')
      const text = Util.formatDate(date, 'YYYY/M/D h:m:s')
      assert(text === null)
    })
  })

  /** @test {Util#uniquePathWithSequentialNumber} */
  describe('uniquePathWithSequentialNumber', () => {
    it('Unique path: directory', () => {
      const actual = Util.uniquePathWithSequentialNumber('./test')
      const expect = Path.resolve('./test-1')
      assert(actual === expect)
    })

    it('Unique path: file', () => {
      const actual = Util.uniquePathWithSequentialNumber('./src/lib/index.js')
      const expect = Path.resolve('./src/lib/index-1.js')
      assert(actual === expect)
    })

    it('Original path (not exists)', () => {
      const actual = Util.uniquePathWithSequentialNumber('./XXX.md')
      const expect = Path.resolve('./XXX.md')
      assert(actual === expect)
    })
  })
})
