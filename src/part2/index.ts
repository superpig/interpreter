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
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

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
  calculate(type: TokenType, leftValue: number, rightValue: number): number {
    let result: number
    switch (type) {
      case TokenType.PLUS:
        result = leftValue + rightValue
        break
      case TokenType.MINUS:
        result = leftValue - rightValue
        break
      default:
        break
    }
    return result
  }
  eatOperation(type: TokenType): void {
    switch (type) {
      case TokenType.PLUS:
        this.eat(TokenType.PLUS)
        break
      case TokenType.MINUS:
        this.eat(TokenType.MINUS)
        break
      default:
        break
    }
  }
  expr(): number {
    this.currentToken = this.getNextToken()

    let result: number = this.currentToken.value
    this.eat(TokenType.INTEGER)
    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const type = this.currentToken.type
      this.eatOperation(type)
      result = this.calculate(type, result, this.currentToken.value)
      this.eat(TokenType.INTEGER)
    }

    return result
  }
}
