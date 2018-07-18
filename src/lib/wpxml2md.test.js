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
single: true
---

`
      assert(actual === expected)
    })
  })
})
