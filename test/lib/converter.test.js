import assert from 'power-assert';
import Converter from '../../src/lib/converter.js';

/** @test {Converter} */
describe( 'Converter', () => {
  /** @test {Converter#convert} */
  describe( 'convert: Markdown', () => {
    it( '<p>', () => {
      const post     = '<p>\nLine 1\n\nLine 2\n</p>';
      const expected = 'Line 1\n\nLine 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<br>', () => {
      const post     = 'Line 1<br>Line 2<br>Line 3';
      const expected = 'Line 1  \nLine 2  \nLine 3';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<h1> - <h6>, and Markdown Extra Link', () => {
      const post =
`<h1>Title</h1>
  <h2 id="header-2">Header 2</h2>
    <h3>Header 3</h3>
      <h4>Header 4</h4>
        <h5>Header 5</h5>
          <h6>Header 6</h6>`;

      const expected =
`# Title

## Header 2 {#header-2}

### Header 3

#### Header 4

##### Header 5

###### Header 6`;

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<hr>', () => {
      const post     = '<hr>';
      const expected = '* * *';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<em>, <i>', () => {
      const post     = '<em>Word 1</em> <i>Word 2</i>';
      const expected = '_Word 1_ _Word 2_';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<code>', () => {
      const post     = 'Text <code>Code</code> Text';
      const expected = 'Text `Code` Text';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<a>', () => {
      const post     = 'Text <a href="://example.com/" title="title">Link</a> Text <a href="#id">Inter Link</a>';
      const expected = 'Text [Link](://example.com/ "title") Text [Inter Link](#id)';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<img>', () => {
      const post     = '<img src="example.png" alt="Title"> <img src="example.png" title="Example">';
      const expected = '![Title](example.png) ![](example.png "Example")';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<pre><code>...</code></pre>', () => {
      const post =
`
Text

<pre><code>
const test = 'test';
</code></pre>

Text
`;

      const expected = 'Text\n\n    const test = \'test\';\n\nText';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<blockquote>', () => {
      const post = '<blockquote>\nLine 1\nLine 2\n</blockquote>';
      const expected = '> Line 1\n> Line 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<ul><li>', () => {
      const post =
`<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>`;
      const expected = '*   Item 1\n*   Item 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<ul><li>, nested', () => {
      const post =
`<ul>
  <li>Item 1
    <ul>
      <li>Item 1-1</li>
      <li>Item 1-2</li>
    </ul>
  </li>
  <li>Item 2</li>
</ul>`;
      const expected = '*   Item 1\n\n    *   Item 1-1\n    *   Item 1-2\n\n*   Item 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<ol><li>', () => {
      const post =
`<ol>
  <li>Item 1</li>
  <li>Item 2</li>
</ol>`;
      const expected = '1.  Item 1\n2.  Item 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<ol><li>, nested', () => {
      const post =
`<ol>
  <li>Item 1
    <ol>
      <li>Item 1-1</li>
      <li>Item 1-2</li>
    </ol>
  </li>
  <li>Item 2</li>
</ol>`;
      const expected = '1.  Item 1\n\n    1.  Item 1-1\n    2.  Item 1-2\n\n2.  Item 2';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( 'Block Element', () => {
      const post = '<address>Copyright 2009 - 2016 akabeko All Rights Reserved</address>';
      const expected = '<address>Copyright 2009 - 2016 akabeko All Rights Reserved</address>';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( 'Otherwise', () => {
      const post = '<example>Test</example>';
      const expected = '<example>Test</example>';

      return Converter.convert( post )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );
  } );

  /** @test {Converter#convert} */
  describe( 'convert: GitHub Flavore Markdown', () => {
    it( '<br>', () => {
      const post     = 'Line 1<br>Line 2<br>Line 3';
      const expected = 'Line 1\nLine 2\nLine 3';

      return Converter.convert( post, { gmf: true } )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<del>, <s>, <strike>', () => {
      const post     = '<del>Text 1</del> <s>Text 2</s> <strike>Text 3</strike>';
      const expected = '~~Text 1~~ ~~Text 2~~ ~~Text 3~~';

      return Converter.convert( post, { gmf: true } )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<pre><code>...</code></pre>', () => {
      const post =
`
Text

<pre><code>
const test = 'test';
</code></pre>

Text
`;

      const expected = 'Text\n\n```\n\nconst test = \'test\';\n\n```\n\nText';

      return Converter.convert( post, { gmf: true } )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );

    it( '<div class="highlight highlight-lang"><pre>...</pre></div>', () => {
      const post =
`
Text

<div class="highlight highlight-js"><pre>
const test = 'test';
</pre></div>

Text
`;

      const expected = 'Text\n\n```js\nconst test = \'test\';\n\n```\n\nText';

      return Converter.convert( post, { gmf: true } )
      .then( ( actual ) => {
        assert( actual === expected );
      } );
    } );
  } );
} );
