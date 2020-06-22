import { TokenType, Lexer, Token } from './parser'

export default class Interpreter {
  private lexer: Lexer = null
  private currentToken: Token = null
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }
  public expr() {
    /*
      Arithmetic expression parser / interpreter.
        expr   : factor ((MUL | DIV) factor)*
        factor : INTEGER
    */
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
  private factor() {
    const token = this.currentToken
    this.eat(TokenType.INTEGER)
    return token.value
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
