import Lexer from '../spi/lexer'
import { TokenType } from '../spi/token'
import Interpreter from '../spi/interpreter'
import Parser from '../spi/parser'
const { ASSIGN, DOT, ID, SEMI, BEGIN, END } = TokenType

describe('lexer_test', () => {
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
  test('test_lexer_lparen', () => {
    const lexer = makeLexer('(')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.LPAREN)
    expect(token.value).toBe('(')
  })
  test('test_lexer_rparen', () => {
    const lexer = makeLexer(')')
    const token = lexer.getNextToken()
    expect(token.type).toBe(TokenType.RPAREN)
    expect(token.value).toBe(')')
  })
  test('test_lexer_new_tokens', () => {
    const records = [
      [':=', ASSIGN, ':='],
      ['.', DOT, '.'],
      ['number', ID, 'number'],
      [';', SEMI, ';'],
      ['BEGIN', BEGIN, 'BEGIN'],
      ['END', END, 'END'],
    ]
    for (const [text, type, value ] of records) {
      const lexer = makeLexer(text)
      const token = lexer.getNextToken()
      expect(token.type).toBe(type)
      expect(token.value).toBe(value)
    }
  })
})

describe('interpreter_test', () => {
  function makeInterpreter(text: string) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const interpreter = new Interpreter(parser)
    return interpreter
  }
  test('test_arithmetic_expressions', () => {
    const records = [
      ['3', 3],
      ['2 + 7 * 4', 30],
      ['7 - 8 / 4', 5],
      ['14 + 2 * 3 - 6 / 2', 17],
      ['7 + 3 * (10 / (12 / (3 + 1) - 1))', 22],
      ['7 + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (8)', 10],
      ['7 + (((3 + 2)))', 12],
      ['- 3', -3],
      ['+ 3', 3],
      ['5 - - - + - 3', 8],
      ['5 - - - + - (3 + 4) - +2', 10],
    ]
    for (const [expr, result] of records) {
      const text = `BEGIN a := ${expr} END.`
      const interpreter = makeInterpreter(text)
      interpreter.interpret()
      const globals = interpreter.GLOBAL_SCOPE
      expect(globals.a).toBe(result)
    }
  })
})
