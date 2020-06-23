import { TokenType, Token } from './token'

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

      if (this.isDigit(this.currentChar)) {
        return new Token(TokenType.INTEGER, this.getInteger())
      }

      if (this.currentChar === '-') {
        const token = new Token(TokenType.MINUS, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '+') {
        const token = new Token(TokenType.PLUS, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '*') {
        const token = new Token(TokenType.MUL, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '/') {
        const token = new Token(TokenType.DIV, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '(') {
        const token = new Token(TokenType.LPAREN, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === ')') {
        const token = new Token(TokenType.RPAREN, this.currentChar)
        this.advance()
        return token
      }

      this.error()
    }
    return new Token(TokenType.EOF, null)
  }
  private getInteger(): number {
    let result = ''
    while (this.currentChar !== '' && this.isDigit(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    return Number(result)
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
  private isWhitespace(char: string) {
    return /\s/.test(char)
  }
  private isDigit(char: string): boolean {
    return char && !isNaN(+char)
  }
  private error(): void {
    throw new Error(`Invalid character`)
  }
}
