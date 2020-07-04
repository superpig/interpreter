import Lexer from '../spi/lexer'
import { TokenType } from '../spi/token'
import Interpreter from '../spi/interpreter'
import Parser from '../spi/parser'
import SemanticAnalyzer from '../spi/semanticAnalyzer'
import { CallStack } from '../spi/activationRecord'

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
  test('test_lexer_exception', () => {
    const lexer = makeLexer('<')
    expect(() => {
      lexer.getNextToken()
    })
  })
})

describe('parser_test', () => {
  function makeParser(text: any) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    return parser
  }
  test('test_expression_invalid_syntax_01', () => {
    const text = `
      PROGRAM Test;
      VAR
          a : INTEGER;
      BEGIN
        a := 10 * ;  {Invalid syntax}
      END.
    `
    const parser = makeParser(text)
    expect(() => {
      parser.parse()
    }).toThrowError('Unexpected token -> Token(;, ;, position = 6 : 19)')
  })

  test('test_expression_invalid_syntax_02', () => {
    const parser = makeParser(`
      PROGRAM Test;
      VAR
          a : INTEGER;
      BEGIN
          a := 1 (1 + 2); {Invalid syntax}
      END.
    `)
    expect(() => {
      parser.parse()
    }).toThrowError('Unexpected token -> Token((, (, position = 6 : 18)')
  })
  test('test_maximum_one_VAR_block_is_allowed', () => {
    const parser1 = makeParser(`
      PROGRAM Test;
      BEGIN
      END.
    `)
    const parser2 = makeParser(`
      PROGRAM Test;
      VAR
          a : INTEGER;
      BEGIN
      END.
    `)
    const parser3 = makeParser(`
      PROGRAM Test;
      VAR
          a : INTEGER;
      VAR
          b : INTEGER;
      BEGIN
        a := 5;
        b := a + 10;
      END.
    `)
    expect(() => {
      parser1.parse()
      parser2.parse()
      parser3.parse()
    }).toThrowError('Unexpected token -> Token(VAR, VAR, position = 5 : 10)')
  })
})

describe('SemanticAnalyzer_test', () => {
  function runSemanticAnalyzer(text: any) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const tree = parser.parse()
    const semanticAnalyzer = new SemanticAnalyzer()
    semanticAnalyzer.visit(tree)
    return semanticAnalyzer
  }
  test('test_semantic_duplicate_id_error', () => {
    expect(() => {
      runSemanticAnalyzer(`
        PROGRAM Test;
        VAR
            a : INTEGER;
            a : REAL;  {Duplicate identifier}
        BEGIN
          a := 5;
        END.
      `)
    }).toThrowError('Duplicate id found -> Token(ID, a, position = 5 : 14)')
  })
  test('test_semantic_id_not_found_error', () => {
    expect(() => {
      runSemanticAnalyzer(`
        PROGRAM Test;
        VAR
            a : INTEGER;
        BEGIN
          a := 5 + b;
        END.
      `)
    }).toThrowError('Identifier not found -> Token(ID, b, position = 6 : 21)')
  })
})

export class TestCallStack {
  private records: any[]
  constructor() {
    this.records = []
  }
  public push(ar) {
    this.records.push(ar)
  }
  public pop() {
    // do nothing
  }
  public peek() {
    return this.records[this.records.length - 1]
  }
}

describe('interpreter_test', () => {
  function makeInterpreter(text: string) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const tree = parser.parse()
    const semanticAnalyzer = new SemanticAnalyzer()
    semanticAnalyzer.visit(tree)

    const interpreter = new Interpreter(tree)
    interpreter.callStack = new TestCallStack()
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
      const ar = interpreter.callStack.peek()
      expect(ar.get('a')).toBe(result)
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
      const ar = interpreter.callStack.peek()
      expect(ar.get('a')).toBe(result)
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

  test('test_variable_name_error01', () => {
    expect(() => {
      const interpreter = makeInterpreter(
        `
          PROGRAM NameError1;
          VAR
            a : INTEGER;

          BEGIN
            a := 2 + b;
          END.
        `
      )
      interpreter.interpret()
    }).toThrow()
  })

  test('test_variable_name_error02', () => {
    expect(() => {
      const interpreter = makeInterpreter(
        `
          PROGRAM NameError2;
          VAR
            b : INTEGER;

          BEGIN
            b := 1;
            a := b + 2;
          END.
        `
      )
      interpreter.interpret()
    }).toThrow()
  })

  test('test_program', () => {
    const text = `
      PROGRAM Part12;
      VAR
        number : INTEGER;
        a, b   : INTEGER;
        y      : REAL;
      PROCEDURE P1;
      VAR
        a : REAL;
        k : INTEGER;
        PROCEDURE P2;
        VAR
            a, z : INTEGER;
        BEGIN {P2}
            z := 777;
        END;  {P2}
      BEGIN {P1}
      END;  {P1}
      BEGIN {Part12}
        number := 2;
        a := number ;
        b := 10 * a + 10 * number DIV 4;
        y := 20 / 7 + 3.14
      END.  {Part12}
    `
    const interpreter = makeInterpreter(text)
    interpreter.interpret()
    const ar = interpreter.callStack.peek()
    expect(ar.members.size).toBe(4)
    expect(ar.get('number')).toBe(2)
    expect(ar.get('a')).toBe(2)
    expect(ar.get('b')).toBe(25)
    expect(ar.get('y')).toBe(20 / 7 + 3.14)
  })
})
