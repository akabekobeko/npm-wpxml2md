import assert from 'power-assert';
import Converter from '../../src/lib/converter.js';

/** @test {Converter} */
describe( 'Converter', () => {
  /** @test {Converter#convert} */
  describe( 'convert', () => {
    it( 'Header', () => {
      const post =
`
<h1>Title</h1>
<h2>Header 2</h2>
<h3>Header 3</h3>
<h4>Header 4</h4>
<h5>Header 5</h5>
<h6>Header 6</h6>
`;
      return Converter.convert( post )
      .then( ( md ) => {
        const actual =
`# Title

## Header 2

### Header 3

#### Header 4

##### Header 5

###### Header 6`;
        assert( md === actual );
      } );
    } );
  } );
} );
