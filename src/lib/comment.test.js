import assert from 'assert'
import Rewire from 'rewire'

describe('Comment', () => {
  const Module = Rewire('./comment.js')
  describe('convertBody', () => {
    const convertBody = Module.__get__('convertBody')

    it('Normal', () => {
      const actual = convertBody(`aaa\nbbb`)
      const expected = '  > aaa\n  > bbb'
      assert(actual === expected)
    })
  })

  describe('convertMarkdown', () => {
    const convertMarkdown = Module.__get__('convertMarkdown')

    it('Tree', () => {
      const comments = [
        {
          author: 'akabeko',
          date: { year: '2017', month: '12', day: '28', time: '09:42:28' },
          url: 'http://akabeko.me/',
          mail: `sample@example.com`,
          content: 'aaaaa\naaaaa',
          children: [
            {
              author: 'anonymous',
              date: { year: '2017', month: '12', day: '28', time: '09:45:12' },
              mail: `sample2@example.com`,
              content: 'bbbbb',
              children: [
                {
                  author: 'anonymous',
                  date: { year: '2017', month: '12', day: '29', time: '17:01:47' },
                  content: 'ccccc\nccccc'
                }
              ]
            }
          ]
        },
        {
          author: 'anonymous',
          date: { year: '2017', month: '12', day: '29', time: '18:17:33' },
          content: 'zzzzzz'
        }
      ]

      const actual = convertMarkdown(comments)
      const expected =
`* ![akabeko](https://www.gravatar.com/avatar/45e67126a4c44c6ae030279e21437c79?d=identicon) **[akabeko](http://akabeko.me/)** 2017-12-28T09:42:28Z
  > aaaaa
  > aaaaa
* ![anonymous](https://www.gravatar.com/avatar/cc7cd2a9c587aafc83517c97ab675864?d=identicon) **anonymous** 2017-12-28T09:45:12Z
  > bbbbb
* **anonymous** 2017-12-29T17:01:47Z
  > ccccc
  > ccccc
* **anonymous** 2017-12-29T18:17:33Z
  > zzzzzz
`

      assert(actual === expected)
    })

    it('Empty', () => {
      const actual = convertMarkdown()
      const expected = ''
      assert(actual === expected)
    })
  })

  describe('createCommentTree', () => {
    const createCommentTree = Module.__get__('createCommentTree')

    it('Create tree', () => {
      const comments = [
        { id: '1' },
        { id: '2', parent: '1' },
        { id: '3' },
        { id: '4', parent: '2' }
      ]
      const actual = createCommentTree(comments)
      const expected = [
        {
          id: '1',
          children: [
            {
              id: '2',
              parent: '1',
              children: [
                {
                  id: '4',
                  parent: '2'
                }
              ]
            }
          ]
        },
        { id: '3' }
      ]

      assert.deepStrictEqual(actual, expected)
    })

    it('Empty', () => {
      const actual = createCommentTree()
      const expected = []
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('parse', () => {
    const parse = Module.__get__('parse')

    it('Single comment', () => {
      const comments = [{
        'wp:comment_id': ['66571'],
        'wp:comment_author': ['anonymous'],
        'wp:comment_author_email': ['anonymous@example.com'],
        'wp:comment_author_url': ['http://example.com/'],
        'wp:comment_author_IP': ['192.168.0.0'],
        'wp:comment_date': ['2017-12-28 13:59:53'],
        'wp:comment_date_gmt': ['2017-12-28 04:59:53'],
        'wp:comment_content': ['Message\nMessage\n\nMessage'],
        'wp:comment_approved': ['1'],
        'wp:comment_type': [],
        'wp:comment_parent': ['0'],
        'wp:comment_user_id': ['0']
      }]

      const actual = parse(comments)
      const expected = [
        {
          id: '66571',
          author: 'anonymous',
          mail: 'anonymous@example.com',
          url: 'http://example.com/',
          date: { year: '2017', month: '12', day: '28', time: '04:59:53' },
          content: 'Message\nMessage\n\nMessage',
          parent: '0'
        }
      ]

      assert.deepStrictEqual(actual, expected)
    })

    it('Empty', () => {
      const actual = parse()
      const expected = []
      assert.deepStrictEqual(actual, expected)
    })
  })
})
