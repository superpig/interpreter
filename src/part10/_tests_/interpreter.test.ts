import Lexer from '../spi/lexer'
import { TokenType } from '../spi/token'
import Interpreter from '../spi/interpreter'
import Parser from '../spi/parser'
const { BEGIN, END, ID, ASSIGN, SEMI, DOT, INTEGER_DIV, FLOAT_DIV, REAL_CONST, INTEGER_CONST, MINUS, PLUS, MUL, LPAREN, RPAREN } = TokenType

describe('lexer_test', () => {
  function makeLexer(text: any) {
    const lexer = new Lexer(text)
    return lexer
  }
  test('test_lexer_tokens', () => {
    const records = [
      ['234', INTEGER_CONST, 234],
      ['3.14', REAL_CONST, 3.14],
      ['*', MUL, '*'],
      ['DIV', INTEGER_DIV, 'DIV'],
      ['/', FLOAT_DIV, '/'],
      ['+', PLUS, '+'],
      ['-', MINUS, '-'],
      ['(', LPAREN, '('],
      [')', RPAREN, ')'],
      [':=', ASSIGN, ':='],
      ['.', DOT, '.'],
      ['number', ID, 'number'],
      [';', SEMI, ';'],
      ['BEGIN', BEGIN, 'BEGIN'],
      ['END', END, 'END']
    ]
    for (const [text, type, value] of records) {
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
      ['5 - - - + - (3 + 4) - +2', 10]
    ]
    for (const [expr, result] of records) {
      const text = `
        PROGRAM Test;
        VAR
            a : INTEGER;
        BEGIN
            a := ${expr}
        END.
      `
      const interpreter = makeInterpreter(text)
      interpreter.interpret()
      const globals = interpreter.GLOBAL_SCOPE
      expect(globals.a).toBe(result)
    }
  })
  test('test_float_arithmetic_expressions', () => {
    const records = [
      ['3.14', 3.14],
      ['2.14 + 7 * 4', 30.14],
      ['7.14 - 8 / 4', 5.14]
    ]
    for (const [expr, result] of records) {
      const text = `
        PROGRAM Test;
        VAR
            a : REAL;
        BEGIN
            a := ${expr}
        END.
      `
      const interpreter = makeInterpreter(text)
      interpreter.interpret()
      const globals = interpreter.GLOBAL_SCOPE
      expect(globals.a).toBe(result)
    }
  })
  test('test_expression_invalid_syntax_01', () => {
    expect(() => {
      const interpreter = makeInterpreter(
        `
          PROGRAM Test;
          BEGIN
            a := 10 * ;  {Invalid syntax}
          END.
        `
      )
      interpreter.interpret()
    }).toThrow()
  })
  test('test_expression_invalid_syntax_02', () => {
    expect(() => {
      const interpreter = makeInterpreter(
        `
          PROGRAM Test;
          BEGIN
            a := 1 (1 + 2); {Invalid syntax}
          END.
        `
      )
      interpreter.interpret()
    }).toThrow()
  })

  test('test_program', () => {
    const text = `
      PROGRAM Part10;
      VAR
          number     : INTEGER;
          a, b, c, x : INTEGER;
          y          : REAL;
      BEGIN {Part10}
          BEGIN
            number := 2;
            a := number;
            b := 10 * a + 10 * number DIV 4;
            c := a - - b
          END;
          x := 11;
          y := 20 / 7 + 3.14;
      END.  {Part10}
    `
    const interpreter = makeInterpreter(text)
    interpreter.interpret()
    const globals = interpreter.GLOBAL_SCOPE
    expect(globals.number).toBe(2)
    expect(globals.a).toBe(2)
    expect(globals.b).toBe(25)
    expect(globals.c).toBe(27)
    expect(globals.x).toBe(11)
    expect(globals.y).toBe(20 / 7 + 3.14)
  })
})
