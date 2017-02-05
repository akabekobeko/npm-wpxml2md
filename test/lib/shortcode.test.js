'use strict';

const assert = require( 'assert' );
const Shortcode = require( '../../src/lib/shortcode.js' ).Shortcode;
const SHCodes = require( '../../src/lib/shortcode.js' ).SHCodes;

/** @test {Shortcode} */
describe( 'Shortcode', () => {
  /** @test {Shortcode#convert} */
  describe( 'convert', () => {
    it( '[code]', () => {
      const text     = '[code]\nCode\n[/code]';
      const actual   = Shortcode.convert( text );
      const expected = '\n\n```\nCode\n```\n\n';
      assert( actual === expected );
    } );

    it( '[code lang="lang"]', () => {
      const text     = '[code lang="lang"]\nCode\n[/code]';
      const actual   = Shortcode.convert( text );
      const expected = '\n\n```lang\nCode\n```\n\n';
      assert( actual === expected );
    } );

    it( '[lang]', () => {
      let text     = '[plain]\nCode\n[/plain]';
      let actual   = Shortcode.convert( text );
      let expected = '\n\n```\nCode\n```\n\n';
      assert( actual === expected );

      text     = '[text]\nCode\n[/text]';
      actual   = Shortcode.convert( text );
      assert( actual === expected );

      for( let i = 3, max = SHCodes.length; i < max; ++i ) {
        const code = SHCodes[ i ];
        text = '[' + code + ']Code[/' + code + ']';
        actual   = Shortcode.convert( text );
        expected = '\n\n```' + code + '\nCode\n```\n\n';
        assert( actual === expected );
      }
    } );
  } );

  /** @test {Shortcode#parse} */
  describe( 'parse', () => {
    it( 'parse', () => {
      const text   = 'caption id="ID" align="alignright" width="300" caption="Caption"';
      const actual = Shortcode.parse( text );
      assert( actual.code           === 'caption' );
      assert( actual.params.id      === 'ID' );
      assert( actual.params.align   === 'alignright' );
      assert( actual.params.width   === '300' );
      assert( actual.params.caption === 'Caption' );
    } );
  } );

  /** @test {Shortcode#trimLineBreak} */
  describe( 'trimLineBreak', () => {
    it( 'trimLineBreak', () => {
      let actual = Shortcode.trimLineBreak( '\nText\n' );
      assert( actual === 'Text' );

      actual = Shortcode.trimLineBreak( '\n\nText\n' );
      assert( actual === '\nText' );
    } );
  } );
} );
