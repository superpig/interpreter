import { Token, TokenType } from './token'
import Lexer from './lexer'
const { PLUS, MINUS, DIV, MUL, LPAREN, RPAREN, INTEGER, EOF } = TokenType

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

export class UaryOp extends AST {
  public token: Token
  public op: Token
  public expr: AST
  constructor(op: Token, expr: AST) {
    super()
    this.token = this.op = op
    this.expr = expr
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
    const tree = this.expr()
    if (this.currentToken.type !== EOF) {
      this.error()
    }
    return tree
  }
  private expr(): AST {
    let node = this.term()
    while (this.currentToken.type === PLUS || this.currentToken.type === MINUS) {
      const token = this.currentToken
      if (token.type === PLUS) {
        this.eat(PLUS)
      } else if (token.type === MINUS) {
        this.eat(MINUS)
      }
      node = new BinOp(node, token, this.term())
    }
    return node
  }
  private term(): AST {
    let node = this.factor()
    while (this.currentToken.type === MUL || this.currentToken.type === DIV) {
      const token = this.currentToken
      if (token.type === MUL) {
        this.eat(MUL)
      } else if (token.type === DIV) {
        this.eat(DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }
  private factor(): AST {
    const token = this.currentToken
    if (token.type === PLUS) {
      this.eat(PLUS)
      const node = new UaryOp(token, this.factor())
      return node
    } else if (token.type === MINUS) {
      this.eat(MINUS)
      const node = new UaryOp(token, this.factor())
      return node
    } else if (token.type === LPAREN) {
      this.eat(LPAREN)
      const node = this.expr()
      this.eat(RPAREN)
      return node
    } else if (token.type === INTEGER) {
      this.eat(INTEGER)
      return new Num(token)
    }
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
