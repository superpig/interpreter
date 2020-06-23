import { TokenType, Lexer, Token } from './lexer'

export default class Interpreter {
  private lexer: Lexer = null
  private currentToken: Token = null
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }
  public expr(): number {
    /*
      Arithmetic expression parser / interpreter.

        calc>  14 + 2 * 3 - 6 / 2
        17

        expr   : term ((PLUS | MINUS) term)*
        term   : factor ((MUL | DIV) factor)*
        factor : INTEGER
    */
    let result = this.term()
    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const token = this.currentToken
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS)
        result = result + this.term()
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS)
        result = result - this.term()
      }
    }
    return result
  }
  public term(): number {
    let result = this.factor()
    while (this.currentToken.type === TokenType.MUL || this.currentToken.type === TokenType.DIV) {
      const token = this.currentToken
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL)
        result = result * this.factor()
      } else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV)
        result = result / this.factor()
      }
    }
    return result
  }
  private factor(): number {
    const token = this.currentToken
    this.eat(TokenType.INTEGER)
    return Number(token.value)
  }
  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error()
    }
  }
  private error() {
    throw new Error(`Invalid syntax`)
  }
}
