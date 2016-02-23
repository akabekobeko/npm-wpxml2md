import assert from 'power-assert';
import Converter from '../../src/lib/converter.js';

/** @test {Converter} */
describe( 'Converter', () => {
  /** @test {Converter#indent} */
  describe( 'indent', () => {
    it( 'Indent ( space and tab )', () => {
      const src    = '  A\n\n  B\n\t\tC';
      const actual = 'A\n\nB\nC';
      const expect = Converter.indent( src );
      assert( expect === actual );
    } );
  } );

  /** @test {Converter#header} */
  describe( 'header', () => {
    it( 'Header ( normal and with id )', () => {
      const src = `
<h1 id="1">Title</h1>
  <h2 class="test" id="1-1">Header 1</h2>

  <h2 id="1-2">Header 2</h2>

    <h3 id="1-2-1">Header 3</h2>

<h2>Header 4</h2>
  `;

      let actual = `
# Title {#1}
  ## Header 1 {#1-1}

  ## Header 2 {#1-2}

    ### Header 3 {#1-2-1}

## Header 4
  `;

      let expect = Converter.header( src );
      assert( expect === actual );

      actual = `
# Title {#1}
## Header 1 {#1-1}

## Header 2 {#1-2}

### Header 3 {#1-2-1}

## Header 4
  `;

      expect = Converter.header( Converter.indent( src ) );
      assert( expect === actual );
    } );
  } );

  /** @test {Converter#link} */
  describe( 'link', () => {
    it( '<a href="http://example.com" target="_blank">Link</a>', () => {
      const src    = '<a href="http://example.com" target="_blank">Link</a>';
      const actual = '[Link](http://example.com)';
      const expect = Converter.link( src );
      assert( expect === actual );
    } );

    it( 'with Parentheses: <a href="http://example.com/test(5)(test).aspx">Link</a>', () => {
      const src    = '<a href="http://example.com/test(5)(test).aspx" target="_blank">Link</a>';
      const actual = '[Link](http://example.com/test%285%29%28test%29.aspx)';
      const expect = Converter.link( src );
      assert( expect === actual );
    } );
  } );

  /** @test {Converter#shortcodeSyntaxHighlighterEvolved} */
  describe( 'shortcodeSyntaxHighlighterEvolved', () => {
    it( '[code lang="lang"]...[/code]', () => {
      const src = `
[code lang="html" highlight="1,4"]
<div>
  test
</div>
[/code]
`;

      const actual = `
\`\`\`html
<div>
  test
</div>
\`\`\`
`;

      const expect = Converter.shortcodeSyntaxHighlighterEvolved( src );
      assert( expect === actual );
    } );

    it( '[html param="value"]...[/html]', () => {
      const src = `
[html highlight="1,4"]
<div>
  test
</div>
[/html]
`;

      const actual = `
\`\`\`html
<div>
  test
</div>
\`\`\`
`;

      const expect = Converter.shortcodeSyntaxHighlighterEvolved( src );
      assert( expect === actual );
    } );
  } );
} );
