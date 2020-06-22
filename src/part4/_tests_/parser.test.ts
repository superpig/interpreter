import { Parser, Lexer } from '../parser'

describe('parser', () => {
  function makeParser(text: string) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    return parser
  }
  test('test_expression1', () => {
    const parser = makeParser('7')
    parser.parse()
  })
  test('test_expression2', () => {
    const parser = makeParser('7 * 4 / 2')
    parser.parse()
  })
  test('test_expression3', () => {
    const parser = makeParser('7 * 4 / 2 * 3')
    parser.parse()
  })
  test('test_expression_invalid_syntax', () => {
    expect(() => {
      const parser = makeParser('7 *')
      parser.parse()
    }).toThrow()
  })
})
