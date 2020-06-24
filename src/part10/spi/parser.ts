import { Token, TokenType } from './token'
import Lexer from './lexer'
const {
  BEGIN,
  END,
  ID,
  ASSIGN,
  SEMI,
  DOT,
  PROGRAM,
  VAR,
  INTEGER_DIV,
  FLOAT_DIV,
  INTEGER,
  REAL,
  REAL_CONST,
  INTEGER_CONST,
  MINUS,
  PLUS,
  MUL,
  LPAREN,
  RPAREN,
  COLON,
  COMMA,
  EOF
} = TokenType

export class AST {
  // empty
}

export class Program extends AST {
  public name: string
  public block: AST
  constructor(name, block) {
    super()
    this.name = name
    this.block = block
  }
}

export class Block extends AST {
  public declarations
  public compoundStatement
  constructor(declarations, compoundStatement) {
    super()
    this.declarations = declarations
    this.compoundStatement = compoundStatement
  }
}

export class VarDecl extends AST {
  public varNode: Var
  public typeNode: Type
  constructor(varNode, typeNode) {
    super()
    this.varNode = varNode
    this.typeNode = typeNode
  }
}

export class Type extends AST {
  public token: Token
  public value: any
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value
  }
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
  public value: string
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
  /**
   * 文法规则 program : compound_statement DOT
   */
  private program() {
    this.eat(PROGRAM)
    const varNode = this.variable()
    const programName = varNode.value
    this.eat(SEMI)
    const blockNode = this.block()
    const programNode = new Program(programName, blockNode)
    this.eat(DOT)
    return programNode
  }
  /**
   * 文法规则 block : declarations compound_statement
   */
  private block() {
    const declarationNodes = this.declarations()
    const compoundStatementNode = this.compoundStatement()
    const node = new Block(declarationNodes, compoundStatementNode)
    return node
  }
  /**
   * 文法规则 declarations : VAR (variable_declaration SEMI)+
   *                       | empty
   */
  private declarations() {
    const declarations = []
    if (this.currentToken.type === VAR) {
      this.eat(VAR)
      // @ts-ignore
      while (this.currentToken.type === ID) {
        const varDecl = this.variableDeclaration()
        declarations.push(...varDecl)
        this.eat(SEMI)
      }
    }
    return declarations
  }
  /**
   * 文法规则 variable_declaration : ID (COMMA ID)* COLON type_spec
   */
  private variableDeclaration() {
    const varNodes = [ new Var(this.currentToken) ]
    this.eat(ID)
    while (this.currentToken.type === COMMA) {
      this.eat(COMMA)
      varNodes.push(new Var(this.currentToken))
      this.eat(ID)
    }
    this.eat(COLON)
    const typeNode = this.typeSpec()
    const varDeclarations = varNodes.map(varNode => {
      return new VarDecl(varNode, typeNode)
    })
    return varDeclarations
  }
  /**
   * 文法规则 type_spec : INTEGER
   *                   | REAL
   */
  private typeSpec() {
    const token = this.currentToken
    if (token.type === INTEGER) {
      this.eat(INTEGER)
    } else {
      this.eat(REAL)
    }
    const node = new Type(token)
    return node
  }
  /**
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
  /**
   * 文法规则 statement_list : statement
   *                        | statement SEMI statement_list
   */
  private statementList(): AST[] {
    const node = this.statement()
    const result = [node]
    while (this.currentToken.type === SEMI) {
      this.eat(SEMI)
      result.push(this.statement())
    }
    if (this.currentToken.type === ID) {
      this.error()
    }
    return result
  }
  /**
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
  /**
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
  /**
   * 文法规则 variable : ID
   */
  private variable() {
    const node = new Var(this.currentToken)
    this.eat(ID)
    return node
  }
  /**
   * An empty production
   */
  private empty() {
    return new NoOp()
  }
  /**
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
  /**
   * 文法规则 term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
   */
  private term(): AST {
    let node = this.factor()
    const oprators = [ MUL, INTEGER_DIV, FLOAT_DIV ]
    while (oprators.includes(this.currentToken.type)) {
      const token = this.currentToken
      if (token.type === MUL) {
        this.eat(MUL)
      } else if (token.type === INTEGER_DIV) {
        this.eat(INTEGER_DIV)
      } else if (token.type === FLOAT_DIV) {
        this.eat(FLOAT_DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }
  /**
   * 文法规则  factor : PLUS factor
   *                 | MINUS factor
   *                 | INTEGER_CONST
   *                 | REAL_CONST
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
    } else if (token.type === INTEGER_CONST) {
      this.eat(INTEGER_CONST)
      return new Num(token)
    } else if (token.type === REAL_CONST) {
      this.eat(REAL_CONST)
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
