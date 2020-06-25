import { TokenType, Token } from './token'

const {
  BEGIN,
  END,
  ID,
  ASSIGN,
  SEMI,
  DOT,
  PROGRAM,
  VAR,
  INTEGER_DIV,
  FLOAT_DIV,
  INTEGER,
  REAL,
  REAL_CONST,
  INTEGER_CONST,
  MINUS,
  PLUS,
  MUL,
  LPAREN,
  RPAREN,
  COLON,
  COMMA,
  PROCEDURE,
  EOF
} = TokenType

const RESERVED_KEYWORDS = {
  PROGRAM: new Token(PROGRAM, 'PROGRAM'),
  VAR: new Token(VAR, 'VAR'),
  DIV: new Token(INTEGER_DIV, 'DIV'),
  INTEGER: new Token(INTEGER, 'INTEGER'),
  REAL: new Token(REAL, 'REAL'),
  BEGIN: new Token(BEGIN, 'BEGIN'),
  PROCEDURE: new Token(PROCEDURE, 'PROCEDURE'),
  END: new Token(END, 'END')
}
/*
 * 词法分析器
 */
export default class Lexer {
  private text: string = ''
  private pos: number = 0
  private currentChar: string = ''
  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentChar = this.text.charAt(this.pos)
  }
  public getNextToken(): Token {
    while (this.currentChar !== '') {
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

      if (this.currentChar === '{') {
        this.advance()
        this.skipComment()
        continue
      }

      if (this.isAlpha(this.currentChar)) {
        return this.id()
      }

      if (this.isDigit(this.currentChar)) {
        return this.number()
      }

      if (this.currentChar === ':' && this.peek() === '=') {
        this.advance()
        this.advance()
        return new Token(ASSIGN, ':=')
      }

      if (this.currentChar === ';') {
        this.advance()
        return new Token(SEMI, ';')
      }

      if (this.currentChar === ':') {
        this.advance()
        return new Token(COLON, this.currentChar)
      }

      if (this.currentChar === ',') {
        this.advance()
        return new Token(COMMA, this.currentChar)
      }

      if (this.currentChar === '-') {
        const token = new Token(MINUS, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '+') {
        const token = new Token(PLUS, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '*') {
        const token = new Token(MUL, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '/') {
        const token = new Token(FLOAT_DIV, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '(') {
        const token = new Token(LPAREN, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === ')') {
        const token = new Token(RPAREN, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '.') {
        this.advance()
        return new Token(DOT, '.')
      }

      this.error()
    }
    return new Token(EOF, null)
  }
  /**
   * 从输入中读取整数或浮点数
   */
  private number() {
    let result = ''
    let token = null
    while (this.currentChar !== '' && this.isDigit(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    if (this.currentChar === '.') {
      result += this.currentChar
      this.advance()
      // @ts-ignore
      while (this.currentChar !== '' && this.isDigit(this.currentChar)) {
        result += this.currentChar
        this.advance()
      }
      token = new Token(REAL_CONST, parseFloat(result))
    } else {
      token = new Token(INTEGER_CONST, parseInt(result))
    }
    return token
  }
  private advance(): void {
    this.pos++
    if (this.pos > this.text.length - 1) {
      this.currentChar = ''
    } else {
      this.currentChar = this.text.charAt(this.pos)
    }
  }
  private skipWhitespace(): void {
    while (this.currentChar && this.isWhitespace(this.currentChar)) {
      this.advance()
    }
  }
  private skipComment(): void {
    while (this.currentChar !== '}') {
      this.advance()
    }
    this.advance()
  }
  private isWhitespace(char: string) {
    return /\s/.test(char)
  }
  private isDigit(char: string): boolean {
    return char && !isNaN(+char)
  }
  /**
   * 处理标识符和关键字
   */
  private id() {
    let result = ''
    while (this.currentChar !== '' && this.isalnum(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    const token = RESERVED_KEYWORDS[result] || new Token(ID, result)
    return token
  }
  private isalnum(str: string): boolean {
    return /^[0-9a-zA-Z]*$/.test(str)
  }
  private isAlpha(char: string): boolean {
    return /^[A-Z]$/i.test(char)
  }
  private peek() {
    const peekPos = this.pos + 1
    if (peekPos > this.text.length - 1) {
      return null
    }
    return this.text[peekPos]
  }
  private error(): void {
    throw new Error(`Invalid character`)
  }
}
