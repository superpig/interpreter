// EOF 表示程序结束
enum TokenType {
  INTEGER = 'INTEGER',
  PLUS = 'PLUS',
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

  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentToken = null
  }
  getNextToken(): Token {
    const text = this.text

    if (this.pos > this.text.length - 1) {
      return new Token(TokenType.EOF, null)
    }

    let currentChar = text.charAt(this.pos)
    if (this.isDigit(currentChar)) {
      while (this.isDigit(text.charAt(++this.pos))) {
        currentChar += text.charAt(this.pos)
      }
      const token = new Token(TokenType.INTEGER, +currentChar)
      return token
    }

    if (currentChar === '+') {
      const token = new Token(TokenType.PLUS, currentChar)
      this.pos++
      return token
    }

    this.error()
  }
  isDigit(char: string): boolean {
    return char && !isNaN(+char)
  }
  error(): void {
    throw new Error('Error parsing input')
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
    this.eat(TokenType.PLUS)

    const right: Token = this.currentToken
    this.eat(TokenType.INTEGER)

    const result: number = Number(left.value) + Number(right.value)
    return result
  }
}
