import { TokenType, Token } from './token'
import { LexerError } from './error'

const RESERVED_KEYWORDS = {
  PROGRAM: new Token(TokenType.PROGRAM, 'PROGRAM'),
  PROCEDURE: new Token(TokenType.PROCEDURE, 'PROCEDURE'),
  VAR: new Token(TokenType.VAR, 'VAR'),
  DIV: new Token(TokenType.INTEGER_DIV, 'DIV'),
  INTEGER: new Token(TokenType.INTEGER, 'INTEGER'),
  REAL: new Token(TokenType.REAL, 'REAL'),
  BEGIN: new Token(TokenType.BEGIN, 'BEGIN'),
  END: new Token(TokenType.END, 'END')
}
/*
 * 词法分析器
 */
export default class Lexer {
  private text: string = ''
  private pos: number = 0
  private currentChar: string = ''
  private lineno: number = 0
  private column: number = 0
  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentChar = this.text.charAt(this.pos)
    this.lineno = 1
    this.column = 1
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
        return new Token(TokenType.ASSIGN, ':=', this.lineno, this.column)
      }

      if (Object.values(TokenType).includes(this.currentChar as TokenType)) {
        const token: Token = new Token(this.currentChar as TokenType, this.currentChar, this.lineno, this.column)
        this.advance()
        return token
      }
      this.error()
    }
    return new Token(TokenType.EOF, null)
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
      token = new Token(TokenType.REAL_CONST, parseFloat(result), this.lineno, this.column)
    } else {
      token = new Token(TokenType.INTEGER_CONST, parseInt(result), this.lineno, this.column)
    }
    return token
  }
  private advance(): void {
    if (this.currentChar === '\n') {
      this.lineno += 1
      this.column = 0
    }
    this.pos++
    if (this.pos > this.text.length - 1) {
      // 表示输入结束
      this.currentChar = ''
    } else {
      this.currentChar = this.text.charAt(this.pos)
      this.column += 1
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
    let value = ''
    while (this.currentChar !== '' && this.isalnum(this.currentChar)) {
      value += this.currentChar
      this.advance()
    }
    const token = new Token(null, null, this.lineno, this.column)
    const keyword = RESERVED_KEYWORDS[value.toUpperCase()]
    if (keyword) {
      token.type = keyword.type
      token.value = value.toUpperCase()
    } else {
      token.type = TokenType.ID
      token.value = value
    }
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
    const message = `Lexer error on ${this.currentChar} line: ${this.lineno} column: ${this.column}`
    throw new LexerError(null, null, message)
  }
}
