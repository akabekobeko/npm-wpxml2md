# npm-wpxml2md

[![npm version](https://badge.fury.io/js/wpxml2md.svg)](https://badge.fury.io/js/wpxml2md)
[![Build Status](https://travis-ci.org/akabekobeko/npm-wpxml2md.svg?branch=master)](https://travis-ci.org/akabekobeko/npm-wpxml2md)
[![Document](https://doc.esdoc.org/github.com/akabekobeko/npm-wpxml2md/badge.svg?t=0)](https://doc.esdoc.org/github.com/akabekobeko/npm-wpxml2md)

Convert the WordPress XML file to Markdown files.

## Installation

```
$ npm install wpxml2md
```

## WordPress XML

Can export the **WordPress XML** in the following way.

1. Displays the management screen of WordPress
1. Select the `Tools` - `Export` from the menu
1. Select `All content` in `Choose what to export`
1. Click to `Download Export File`

## Usage

### Node API

`wpxml2md` is promisify function.

```js
const wpxml2md = require( 'wpxml2md' );

wpxml2md( 'wordpress.xml', 'dest', { report: true } )
.then( () => {
  console.log( 'Completed!!' );
} )
.catch( ( err ) => {
  console.error( err );
} );
```

Add modes:

```js
const wpxml2md = require( 'wpxml2md' );

wpxml2md( 'wordpress.xml', 'dest', { noGFM: true, noMELink: true } )
.then( () => {
  console.log( 'Completed!!' );
} )
.catch( ( err ) => {
  console.error( err );
} );
```

`wpxml2md( src, dest, [OPTIONS] )`

| Name | Type | Description |
|:--------|:--|:--|
|     src |   String | Path of the XML file exported from WordPress. |
|    dest |   String | Destination directory path. |
| options |   Object | Options. |

Options:

| Name | Type | Description |
|:--------|:--|:--|
|    noGFM | Boolean | Disable the Convert the GitHub Flavored Markdown. Default is `false`, enable a conversion.  |
| noMELink | Boolean | Disable the Convert the GitHub Extra link on header. Default is `false`, enable a conversion.  |
|   report | Boolean | Display the process reports. Default is `false`, disable a report. |

### CLI

```
Usage: wpxml2md [OPTIONS]

  Convert the WordPress XML file to Markdown files.

  Options:
    -h, --help    Display this text.

    -v, --version Display the version number.

    -i, --input   Path of the XML file exported from WordPress.

    -o, --output  Path of the output directory.

    -m, --modes   Specify the mode in the comma separated.
                  "no-gfm" is to disable the GitHub Flavored Markdown
                  "no-melink" is to disable the Markdown Extra link on header

    -r, --report  Display the process reports.
                  Default is disable.

  Examples:
    $ wpxml2md -i wordpress.xml -o ./dist -r
    $ wpxml2md -i wordpress.xml -o ./dist -m no-gfm,no-melink -r

  See also:
    https://github.com/akabekobeko/npm-wpxml2md
```

## Conversion

This section describes the conversion by this tool. Markdown conversion engine was in reference to the design and implementation of the [domchristie/to-markdown](https://github.com/domchristie/to-markdown), rewrite an ES2015 and more.

### Output directories

Converted Markdown files are output in the following directory.

```
YYYYMMDD-hhmmss/
├── pages/
│   └── YYYY/
│       └── MM-DD.md
└── posts/
    └── YYYY/
        └── MM-DD.md
```

* The name of the root directory is the date time that the execution of the processing
* The result of converting the **Pages** will be output to the `pages` directory
* The result of converting the **Posts** will be output to the `posts` directory
* Markdown's file name is posted date time.
* If the file or directory name is a duplicate will be added to the **sequential number** at the end.

### HTML TAG

Default markdown.

| TAG | Markdown |
|:--|:--|
| `Plain Text` | Plain text will keep the line breaks and blank lines. It is a specification to enable the WordPress of paragraph function. |
| `<p>` | `\n\nTEXT\n\n` |
| `<br>` | `  \n` |
| `<h1>` | `\n\n# TEXT\n\n`, support from `h1` to `h6`. |
| `<h1 id="id">` | `\n\n# TEXT {#id}\n\n`, for Markdown Extra |
| `<hr>` | `\n\n* * *\n\n` |
| `<em>`, `<i>` | `_TEXT_` |
| `<strong>`, `<b>` | `**TEXT**` |
| `<code>` | `` `TEXT` `` |
| `<a>` | `[TEXT](URL "ALT")` |
| `<img>` | `![TITLE](URL)` |
| `<pre><code>` | `\n\n    TEXT\n\n` |
| `<blockquote>` | `\n\n> TEXT\n\n` |
| `<ul><li>` | `\n\n* TEXT\n\n` |
| `<ol><li>` | `\n\n1. TEXT\n\n` |

GitHub Flavored Markdown.

| TAG | Markdown |
|:--|:--|
| `<br>` | `\n` |
| `<del>`, `<s>`, `<strike>` | `~~TEXT~~` |
| `<ul><li><input type="checkbox">` | `* [ ] Text`, **checked** is true if `[x]`. |
| `<table>` | see: [Organizing information with tables - User Documentation](https://help.github.com/articles/organizing-information-with-tables/) |
| `<pre><code>` | ````\n\n```\nCODE\n```\n\n```` |
| `<div class="highlight highlight-lang"><pre>` | ````\n\n```lang\nCODE\n```\n\n```` |

### Shortcode

#### caption

```
[caption]
<a href="example.png" title="Title">
  <img src="example.png" alt="Title"></a>
</a>
[/caption]
```

Remove the short code dregs. Contents will Markdown conversion as HTML.

```
[![Title](example.png)](example.png "Title")
```
#### code

```
[code lang="js"]
const test = 'test';
console.log( test );
[/code]
```

`code` is converted to a code block.

````
```js
const test = 'test';
console.log( test );
```
````

Short code of programming languages and converts it to a code block.

```
[js]
const test = 'test';
if( test ) {
  console.log( test );  
}
[/js]
```

For example, the above will be converted to the following.

````
```js
const test = 'test';
if( test ) {
  console.log( test );  
}
```
````

Language to be converted is the following. The language names are based on the [SyntaxHighlighter - Bundled Brushes](http://alexgorbatchev.com/SyntaxHighlighter/manual/brushes/).

| Language | Shortcode |
|:--|:--|
| Plain Text | plain, text |
| ActionScript3 | as3, actionscript3 |
| Bash/shell | bash, shell |
| ColdFusion | cf, coldfusion |
| C# | c-sharp, csharp |
| C++ | cpp, c |
| CSS | css |
| Delphi | delphi, pas, pascal |
| Diff | diff, patch |
| Erlang | erl, erlang |
| Groovy | groovy |
| JavaScript | js, jscript, javascript |
| Java | java |
| JavaFX | jfx, javafx |
| Perl | perl, pl |
| PHP | php |
| PowerShell | ps, powershell |
| Python | py, python |
| Ruby | rails, ror, ruby |
| Scala | scala |
| SQL | sql |
| Visual Basic | vb, vbnet |
| XML | xml, xhtml, xslt, html, xhtml |

## ChangeLog

* [CHANGELOG](CHANGELOG.md)

## License

* [MIT](LICENSE.txt)
