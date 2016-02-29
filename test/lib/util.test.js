import assert from 'power-assert';
import Path from 'path';
import Util from '../../src/lib/util.js';

/** @test {Util} */
describe( 'Util', () => {
  /** @test {Util#existsSync} */
  describe( 'existsSync', () => {
    it( 'Exists', () => {
      assert( Util.existsSync( './test' ) );
    } );

    it( 'Not exists', () => {
      assert( !( Util.existsSync( './XXX' ) ) );
    } );
  } );

  /** @test {Util#formatDate} */
  describe( 'formatDate', () => {
    it( 'Default YYYY-MM-DD hh:mm:ss.SSS', () => {
      const date = new Date( 2015, 7, 4, 21, 17, 45, 512 );
      const text = Util.formatDate( date );
      assert( text === '2015-08-04 21:17:45.512' );
    } );

    it( 'Hyphen YYYY-MM-DD-hh-mm-ss', () => {
      const date = new Date( 2015, 7, 4, 21, 17, 45, 512 );
      const text = Util.formatDate( date, 'YYYY-MM-DD-hh-mm-ss' );
      assert( text === '2015-08-04-21-17-45' );
    } );

    it( 'No zero-padding YYYY/M/D h:m:s', () => {
      const date = new Date( 2015, 7, 4, 21, 17, 45, 512 );
      const text = Util.formatDate( date, 'YYYY/M/D h:m:s' );
      assert( text === '2015/8/4 21:17:45' );
    } );
  } );

  /** @test {Util#uniquePathWithSequentialNumber} */
  describe( 'uniquePathWithSequentialNumber', () => {
    it( 'Unique path: directory', () => {
      const actual = Path.resolve( './test-1' );
      const expect = Util.uniquePathWithSequentialNumber( './test' );
      assert( expect === actual );
    } );

    it( 'Unique path: file', () => {
      const actual = Path.resolve( './index-1.js' );
      const expect = Util.uniquePathWithSequentialNumber( './index.js' );
      assert( expect === actual );
    } );

    it( 'Original path ( not exists )', () => {
      const actual = Path.resolve( './XXX.md' );
      const expect = Util.uniquePathWithSequentialNumber( './XXX.md' );
      assert( expect === actual );
    } );
  } );
} );