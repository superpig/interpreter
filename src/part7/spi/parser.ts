import { Token, TokenType } from './token'
import Lexer from './lexer'

export class AST {
  // do nothing
}

export class BinOp extends AST {
  public left: AST
  public op: Token
  public token: Token
  public right: AST
  constructor(left: AST, op: Token, right: AST) {
    super()
    this.left = left
    this.token = this.op = op
    this.right = right
  }
}

export class Num extends AST {
  public token: Token
  public value: any
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
}

/*
 * 语法解析器
 */
export default class Parser {
  private lexer: Lexer = null
  private currentToken: Token = null
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }
  public parse(): AST {
    return this.expr()
  }
  private expr(): AST {
    let node = this.term()
    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const token = this.currentToken
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS)
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS)
      }
      node = new BinOp(node, token, this.term())
    }
    return node
  }
  private term(): AST {
    let node = this.factor()
    while (this.currentToken.type === TokenType.MUL || this.currentToken.type === TokenType.DIV) {
      const token = this.currentToken
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL)
      } else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }
  private factor(): AST {
    const token = this.currentToken
    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN)
      const node = this.expr()
      this.eat(TokenType.RPAREN)
      return node
    }
    this.eat(TokenType.INTEGER)
    return new Num(token)
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
