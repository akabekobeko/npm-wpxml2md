import assert from 'assert'
import Rewire from 'rewire'

/** @test {WordPressXmlToMarkdown} */
describe('WordPressXmlToMarkdown', () => {
  const Module = Rewire('./wpxml2md.js')

  /** @test {replaceLinkURL} */
  describe('replaceLinkURL', () => {
    const replaceLinkURL = Module.__get__('replaceLinkURL')

    it('"/"', () => {
      const text = 'text\n[alt](http://example.com/test/ "title")\ntext'

      const actual = replaceLinkURL(text, 'http://example.com/', '/')
      const expected = 'text\n[alt](/test/ "title")\ntext'
      assert(actual === expected)
    })
  })

  describe('createExcerpt', () => {
    const createExcerpt = Module.__get__('createExcerpt')

    it('Normal', () => {
      const markdown =
`
# 見出し

文章文章**文章文章文章**文章文章文章[aaa](http://example.com)文章文章文章文章

|ヘッダー|ヘッダー|
|---|---|
|値|値|

## 見出し 2

![ZZZ](sample.png)

Sentence__Sentence__Sentence"Sentence"Sentence

* a
* b

## 見出し 2

1. a
2. b
3. c

111.

> 引用
> 引用

42SentenceSentenceSentenceSentenceSentenceSentenceSentenceSentenceSentenceSentenceSentence
`
      const actual = createExcerpt(markdown)
      const expected = '文章文章文章文章文章文章文章文章aaa文章文章文章文章ZZZSentenceSentenceSentence\\"Sentence\\"Sentence111.42SentenceSentenceSen...'
      assert(actual === expected)
    })

    it('Empty', () => {
      const actual = createExcerpt()
      const expected = ''
      assert(actual === expected)
    })
  })

  /** @test {createMetadataHeader} */
  describe('createMetadataHeader', () => {
    const createMetadataHeader = Module.__get__('createMetadataHeader')

    it('Post page', () => {
      const metadata = {
        type: 'post',
        year: '2018',
        month: '06',
        day: '25',
        time: '15:03:20',
        permanentName: 'sample',
        title: 'Sample post',
        categories: ['Sample'],
        tags: ['Sample', 'wpxml2md']
      }

      const actual = createMetadataHeader(metadata)
      const expected =
`---
path: "/posts/2018/06/sample/"
date: "2018-06-25T15:03:20Z"
title: "Sample post"
categories: ["Sample"]
tags: ["Sample", "wpxml2md"]
excerpt: ""
---

`
      assert(actual === expected)
    })

    it('Single page', () => {
      const metadata = {
        type: 'page',
        year: '2018',
        month: '06',
        day: '25',
        time: '18:03:20',
        permanentName: 'sample',
        title: 'Sample page',
        categories: ['Sample'],
        tags: ['Sample', 'wpxml2md']
      }

      const actual = createMetadataHeader(metadata)
      const expected =
`---
path: "/pages/2018/06/sample/"
date: "2018-06-25T18:03:20Z"
title: "Sample page"
categories: ["Sample"]
tags: ["Sample", "wpxml2md"]
excerpt: ""
single: true
---

`
      assert(actual === expected)
    })
  })
})
