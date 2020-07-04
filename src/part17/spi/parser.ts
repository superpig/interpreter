import { Token, TokenType } from './token'
import Lexer from './lexer'
import { ParserError, ErrorCode } from './error'

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

export class Param extends AST {
  public varNode: Var
  public typeNode: Type
  constructor(varNode: Var, typeNode: Type) {
    super()
    this.varNode = varNode
    this.typeNode = typeNode
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

export class ProcedureCall extends AST {
  public procName: string
  public actualParams: Param[]
  public token: Token
  constructor(procName: string, actualParams: Param[], token: Token) {
    super()
    this.procName = procName
    this.actualParams = actualParams
    this.token = token
  }
}

export class ProcedureDecl extends AST {
  public procName: string
  public blockNode: Block
  public params: any[]
  constructor(procName: string, blockNode: Block, params: any[]) {
    super()
    this.procName = procName
    this.blockNode = blockNode
    this.params = params
  }
}

/*
  语法解析器，文法规则如下：
  program : PROGRAM variable SEMI block DOT
  block : declarations compound_statement
  declarations : (VAR (variable_declaration SEMI)+)? procedure_declaration*
  variable_declaration : ID (COMMA ID)* COLON type_spec
  procedure_declaration :
        PROCEDURE ID (LPAREN formal_parameter_list RPAREN)? SEMI block SEMI
  formal_params_list : formal_parameters
                      | formal_parameters SEMI formal_parameter_list
  formal_parameters : ID (COMMA ID)* COLON type_spec
  type_spec : INTEGER | REAL
  compound_statement : BEGIN statement_list END
  statement_list : statement
                  | statement SEMI statement_list
  statement : compound_statement
            | assignment_statement
            | empty
  assignment_statement : variable ASSIGN expr
  empty :
  expr : term ((PLUS | MINUS) term)*
  term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
  factor : PLUS factor
          | MINUS factor
          | INTEGER_CONST
          | REAL_CONST
          | LPAREN expr RPAREN
          | variable
  variable: ID
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
    if (this.currentToken.type !== TokenType.EOF) {
      this.error(ErrorCode.UNEXPECTED_TOKEN, this.currentToken)
    }
    return tree
  }
  /**
   * 文法规则 program : compound_statement DOT
   */
  private program() {
    this.eat(TokenType.PROGRAM)
    const varNode = this.variable()
    const programName = varNode.value
    this.eat(TokenType.SEMI)
    const blockNode = this.block()
    const programNode = new Program(programName, blockNode)
    this.eat(TokenType.DOT)
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
   * 文法规则 declarations : (VAR (variable_declaration SEMI)+)? procedure_declaration*
   */
  private declarations() {
    const declarations = []
    if (this.currentToken.type === TokenType.VAR) {
      this.eat(TokenType.VAR)
      // @ts-ignore
      while (this.currentToken.type === TokenType.ID) {
        const varDecl = this.variableDeclaration()
        declarations.push(...varDecl)
        this.eat(TokenType.SEMI)
      }
    }
    while (this.currentToken.type === TokenType.PROCEDURE) {
      const procDecl = this.procedureDeclaration()
      declarations.push(procDecl)
    }
    return declarations
  }
  /**
   * 文法规则 procedure_declaration : PROCEDURE ID (LPAREN formal_parameter_list RPAREN)? SEMI block SEMI
   */
  private procedureDeclaration() {
    this.eat(TokenType.PROCEDURE)
    const procName = this.currentToken.value
    this.eat(TokenType.ID)
    let params = []

    if (this.currentToken.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN)
      params = this.formalParameterList()
      this.eat(TokenType.RPAREN)
    }
    this.eat(TokenType.SEMI)
    const blockNode = this.block()
    const procDecl = new ProcedureDecl(procName, blockNode, params)
    this.eat(TokenType.SEMI)
    return procDecl
  }
  /**
   * 文法规则 variable_declaration : ID (COMMA ID)* COLON type_spec
   */
  private variableDeclaration() {
    const varNodes = [new Var(this.currentToken)]
    this.eat(TokenType.ID)
    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA)
      varNodes.push(new Var(this.currentToken))
      this.eat(TokenType.ID)
    }
    this.eat(TokenType.COLON)
    const typeNode = this.typeSpec()
    const varDeclarations = varNodes.map((varNode) => {
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
    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER)
    } else {
      this.eat(TokenType.REAL)
    }
    const node = new Type(token)
    return node
  }
  /**
   * 文法规则 compound_statement: BEGIN statement_list END
   */
  private compoundStatement() {
    this.eat(TokenType.BEGIN)
    const nodes = this.statementList()
    this.eat(TokenType.END)
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
    while (this.currentToken.type === TokenType.SEMI) {
      this.eat(TokenType.SEMI)
      result.push(this.statement())
    }
    if (this.currentToken.type === TokenType.ID) {
      this.error(ErrorCode.UNEXPECTED_TOKEN, this.currentToken)
    }
    return result
  }
  /**
   * 文法规则 statement : compound_statement
   *                   | proccall_statement
   *                   | assignment_statement
   *                   | empty
   */
  private statement() {
    let node = null
    if (this.currentToken.type === TokenType.BEGIN) {
      node = this.compoundStatement()
    } else if (this.currentToken.type === TokenType.ID && this.lexer.currentChar === '(') {
      node = this.proccallStatement()
    } else if (this.currentToken.type === TokenType.ID) {
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
    this.eat(TokenType.ASSIGN)
    const right = this.expr()
    const node = new Assign(left, token, right)
    return node
  }
  /**
   * 文法规则 : ID LPAREN (expr (COMMA expr)*)? RPAREN
   */
  private proccallStatement() {
    const token = this.currentToken
    const procName = token.value
    this.eat(TokenType.ID)
    this.eat(TokenType.LPAREN)
    const actualParams = []
    if (this.currentToken.type !== TokenType.RPAREN) {
      const node = this.expr()
      actualParams.push(node)
    }
    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA)
      const node = this.expr()
      actualParams.push(node)
    }
    this.eat(TokenType.RPAREN)
    return new ProcedureCall(procName, actualParams, token)
  }
  /**
   * 文法规则 variable : ID
   */
  private variable() {
    const node = new Var(this.currentToken)
    this.eat(TokenType.ID)
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
  /**
   * 文法规则 term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
   */
  private term(): AST {
    let node = this.factor()
    const oprators = [TokenType.MUL, TokenType.INTEGER_DIV, TokenType.FLOAT_DIV]
    while (oprators.includes(this.currentToken.type)) {
      const token = this.currentToken
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL)
      } else if (token.type === TokenType.INTEGER_DIV) {
        this.eat(TokenType.INTEGER_DIV)
      } else if (token.type === TokenType.FLOAT_DIV) {
        this.eat(TokenType.FLOAT_DIV)
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
    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS)
      const node = new UaryOp(token, this.factor())
      return node
    } else if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS)
      const node = new UaryOp(token, this.factor())
      return node
    } else if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN)
      const node = this.expr()
      this.eat(TokenType.RPAREN)
      return node
    } else if (token.type === TokenType.INTEGER_CONST) {
      this.eat(TokenType.INTEGER_CONST)
      return new Num(token)
    } else if (token.type === TokenType.REAL_CONST) {
      this.eat(TokenType.REAL_CONST)
      return new Num(token)
    } else {
      const node = this.variable()
      return node
    }
  }
  /**
   * formal_parameter_list : formal_parameters
   *                       | formal_parameters SEMI formal_parameter_list
   * eg: procedure Foo(x, y, z: integer; var m: integer);
   */
  private formalParameterList(): Param[] {
    // 没有参数的情况： procedure Foo();
    if (this.currentToken.type !== TokenType.ID) {
      return []
    }
    const paramNodes = this.formalParameters()
    // @ts-ignore
    while (this.currentToken.type === TokenType.SEMI) {
      this.eat(TokenType.SEMI)
      paramNodes.push(...this.formalParameters())
    }
    return paramNodes
  }
  /**
   * formal_parameters : ID (COMMA ID)* COLON type_spec
   */
  private formalParameters(): Param[] {
    const paramNodes: Param[] = []
    const paramTokens = [this.currentToken]
    this.eat(TokenType.ID)
    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA)
      paramTokens.push(this.currentToken)
      this.eat(TokenType.ID)
    }
    this.eat(TokenType.COLON)
    const typeNode = this.typeSpec()

    for (const paramToken of paramTokens) {
      const paramNode = new Param(new Var(paramToken), typeNode)
      paramNodes.push(paramNode)
    }
    return paramNodes
  }
  private eat(tokenType: TokenType): void {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error(ErrorCode.UNEXPECTED_TOKEN, this.currentToken)
    }
  }
  private error(errorCode, token) {
    const message = `${errorCode} -> ${token}`
    throw new ParserError(errorCode, token, message)
  }
}
