import { Token, TokenType } from './token'
import Lexer from './lexer'
const { PLUS, MINUS, DIV, MUL, LPAREN, RPAREN, INTEGER, EOF, DOT, END, BEGIN, SEMI, ID, ASSIGN } = TokenType

export class AST {
  // empty
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

export class Compound extends AST {
  public children: AST[]
  constructor() {
    super()
    this.children = []
  }
}

export class Assign extends AST {
  public left: Var
  public op: Token
  public token: Token
  public right: AST
  constructor(left: Var, op: Token, right: AST) {
    super()
    this.left = left
    this.token = this.op = op
    this.right = right
  }
}

export class Var extends AST {
  public token: Token
  public value: any
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
}

export class NoOp extends AST {
  // empty
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
    const tree = this.program()
    if (this.currentToken.type !== EOF) {
      this.error()
    }
    return tree
  }
  /*
   * 文法规则 program : compound_statement DOT
   */
  private program() {
    const node = this.compoundStatement()
    this.eat(DOT)
    return node
  }
  /*
   * 文法规则 compound_statement: BEGIN statement_list END
   */
  private compoundStatement() {
    this.eat(BEGIN)
    const nodes = this.statementList()
    this.eat(END)
    const root = new Compound()
    for (const node of nodes) {
      root.children.push(node)
    }
    return root
  }
  /*
   * 文法规则 statement_list : statement
   *                        | statement SEMI statement_list
   */
  private statementList(): AST[] {
    const node = this.statement()
    const result = [ node ]
    while (this.currentToken.type === SEMI) {
      this.eat(SEMI)
      result.push(this.statement())
    }
    if (this.currentToken.type === ID) {
      this.error()
    }
    return result
  }
  /*
   * 文法规则 statement : compound_statement
   *                   | assignment_statement
   *                   | empty
   */
  private statement() {
    let node = null
    if (this.currentToken.type === BEGIN) {
      node = this.compoundStatement()
    } else if (this.currentToken.type === ID) {
      node = this.assignmentStatement()
    } else {
      node = this.empty()
    }
    return node
  }
  /*
   * 文法规则 assignment_statement : variable ASSIGN expr
   */
  private assignmentStatement() {
    const left = this.variable()
    const token = this.currentToken
    this.eat(ASSIGN)
    const right = this.expr()
    const node = new Assign(left, token, right)
    return node
  }
  /*
   * 文法规则 variable : ID
   */
  private variable() {
    const node = new Var(this.currentToken)
    this.eat(ID)
    return node
  }
  /*
   * An empty production
   */
  private empty() {
    return new NoOp()
  }
  /*
   * 文法规则 expr: term ((PLUS | MINUS) term)*
   */
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
  /*
   * 文法规则 term: factor ((MUL | DIV) factor)*
   */
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
  /*
   * 文法规则  factor : PLUS factor
   *                 | MINUS factor
   *                 | INTEGER
   *                 | LPAREN expr RPAREN
   *                 | variable
   */
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
    } else {
      const node = this.variable()
      return node
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
