// EOF 表示程序结束
enum TokenType {
  INTEGER = 'INTEGER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  EOF = 'EOF'
}

/*
 * 词法分析的结果 Token 类
 */
class Token {
  public type: TokenType
  public value: any
  constructor(type: TokenType, value: string | number) {
    this.type = type
    this.value = value
  }
  toString(): string {
    return `Token(${this.type}, ${this.value})`
  }
}

/*
 * 解释器，根据程序中的算法执行运算
 */
export default class Interpreter {
  private text: string = ''
  private pos: number = 0
  private currentToken: Token = null
  private currentChar: string = ''

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentToken = null
    this.currentChar = this.text.charAt(this.pos)
  }
  getNextToken(): Token {
    const text = this.text

    while (this.currentChar !== '') {
      console.log(this.currentChar)
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }
      console.log(this.currentChar)

      if (this.isDigit(this.currentChar)) {
        return new Token(TokenType.INTEGER, this.getInteger())
      }

      if (this.currentChar === '+') {
        const token = new Token(TokenType.PLUS, this.currentChar)
        this.advance()
        return token
      }

      if (this.currentChar === '-') {
        const token = new Token(TokenType.MINUS, this.currentChar)
        this.advance()
        return token
      }
      this.error()
    }
    return new Token(TokenType.EOF, null)
  }
  getInteger(): number {
    let result = ''
    while (this.currentChar !== '' && this.isDigit(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    return Number(result)
  }
  advance(): void {
    this.pos++
    if (this.pos > this.text.length - 1) {
      this.currentChar = ''
    } else {
      this.currentChar = this.text.charAt(this.pos)
    }
  }
  skipWhitespace(): void {
    while (this.currentChar && this.isWhitespace(this.currentChar)) {
      this.advance()
    }
  }
  isWhitespace(char: string) {
    return /\s/.test(char)
  }
  isDigit(char: string): boolean {
    return char && !isNaN(+char)
  }
  error(): void {
    throw new Error(`Error parsing input: ${this.currentToken}`)
  }
  eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.getNextToken()
    } else {
      this.error()
    }
  }
  expr(): number {
    this.currentToken = this.getNextToken()

    const left: Token = this.currentToken
    this.eat(TokenType.INTEGER)

    const op: Token = this.currentToken
    if (op.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS)
    } else {
      this.eat(TokenType.MINUS)
    }

    const right: Token = this.currentToken
    this.eat(TokenType.INTEGER)

    const leftValue: number = left.value
    const rightValue: number = right.value
    const result: number = op.type === TokenType.PLUS ? leftValue + rightValue : leftValue - rightValue
    return result
  }
}
