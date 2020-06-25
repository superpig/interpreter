import RPNTranslator from '../ex1'
import Lexer from '../spi/lexer'
import Parser from '../spi/parser'

function translate(text: string) {
  const lexer = new Lexer(text)
  const parser = new Parser(lexer)
  const translator = new RPNTranslator(parser)
  return translator.translate()
}

describe('lexer', () => {
  test('test_1', () => {
    expect(translate('2 + 3')).toBe('2 3 +')
  })
  test('test_2', () => {
    expect(translate('2 + 3 * 5')).toBe('2 3 5 * +')
  })
  test('test_3', () => {
    expect(translate('5 + ((1 + 2) * 4) - 3')).toBe('5 1 2 + 4 * + 3 -')
  })
  test('test_4', () => {
    expect(translate('(5 + 3) * 12 / 3')).toBe('5 3 + 12 * 3 /')
  })
})
