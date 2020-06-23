import Lexer from '../spi/lexer'
import { TokenType } from '../spi/token'
import Interpreter from '../spi/interpreter'
import Parser from '../spi/parser'

describe('lexer', () => {
  function makeLexer(text: string) {
    const lexer = new Lexer(text)
    return lexer
  }
  test('test_lexer_integer', () => {
    const lexer = makeLexer('234')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.INTEGER)
    expect(token.value).toBe(234)
  })
  test('test_lexer_mul', () => {
    const lexer = makeLexer('*')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.MUL)
    expect(token.value).toBe('*')
  })
  test('test_lexer_div', () => {
    const lexer = makeLexer(' / ')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.DIV)
    expect(token.value).toBe('/')
  })
  test('test_lexer_plus', () => {
    const lexer = makeLexer(' + ')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.PLUS)
    expect(token.value).toBe('+')
  })
  test('test_lexer_minus', () => {
    const lexer = makeLexer(' - ')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.MINUS)
    expect(token.value).toBe('-')
  })
})

describe('interpreter', () => {
  function makeInterpreter(text: string) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const interpreter = new Interpreter(parser)
    return interpreter
  }
  test('test_expression1', () => {
    const interpreter = makeInterpreter('2')
    const result = interpreter.interpret()
    expect(result).toBe(2)
  })
  test('test_expression2', () => {
    const interpreter = makeInterpreter('2 + 7 * 4')
    const result = interpreter.interpret()
    expect(result).toBe(30)
  })
  test('test_expression3', () => {
    const interpreter = makeInterpreter('7 - 8 / 4')
    const result = interpreter.interpret()
    expect(result).toBe(5)
  })
  test('test_expression4', () => {
    const interpreter = makeInterpreter('14 + 2 * 3 - 6 / 2')
    const result = interpreter.interpret()
    expect(result).toBe(17)
  })
  test('test_expression5', () => {
    const interpreter = makeInterpreter('7 + 3 * (10 / (12 / (3 + 1) - 1))')
    const result = interpreter.interpret()
    expect(result).toBe(22)
  })
  test('test_expression6', () => {
    const interpreter = makeInterpreter('7 + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (8)')
    const result = interpreter.interpret()
    expect(result).toBe(10)
  })
  test('test_expression7', () => {
    const interpreter = makeInterpreter('7 + (((3 + 2)))')
    const result = interpreter.interpret()
    expect(result).toBe(12)
  })
  test('test_expression_invalid_syntax', () => {
    expect(() => {
      const interpreter = makeInterpreter('10 *')
      interpreter.interpret()
    }).toThrow()
  })
})
