import Parser, { Num, BinOp, AST, UaryOp, NoOp, Compound, Assign, Var } from './parser'
import { TokenType } from './token'
const { PLUS, MINUS, MUL, DIV } = TokenType

export abstract class NodeVisitor {
  abstract visit(node: AST)
}

/*
 * 简单的 Pascal 解释器
 */
export default class Interpreter extends NodeVisitor {
  // 模拟符号表，存储变量的值
  public GLOBAL_SCOPE: {
    [key: string]: number
  } = {}
  private parser: Parser
  constructor(parser: Parser) {
    super()
    this.parser = parser
    this.GLOBAL_SCOPE = {}
  }
  public interpret() {
    const tree = this.parser.parse()
    if (!tree) return ''
    return this.visit(tree)
  }
  public visitCompound(node: Compound) {
    for (const child of node.children) {
      this.visit(child)
    }
  }
  public visit(node: AST) {
    if (node instanceof BinOp) {
      return this.visitBinOp(node)
    } else if (node instanceof Num) {
      return this.visitNum(node)
    } else if (node instanceof UaryOp) {
      return this.visitUnaryOp(node)
    } else if (node instanceof Compound) {
      return this.visitCompound(node)
    } else if (node instanceof Assign) {
      return this.visitAssign(node)
    } else if (node instanceof NoOp) {
      return this.visitNoOp(node)
    } else if (node instanceof Var) {
      return this.visitVar(node)
    } else {
      const name = node && node.constructor.name
      throw new Error(`No visit${name} method`)
    }
  }
  private visitBinOp(node: BinOp) {
    const op = node.op.type
    if (op === PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (op === MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (op === MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (op === DIV) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }
  private visitUnaryOp(node: UaryOp) {
    const op = node.op.type
    if (op === PLUS) {
      return +this.visit(node.expr)
    } else if (op === MINUS) {
      return -this.visit(node.expr)
    }
  }
  private visitAssign(node: Assign) {
    const varName = node.left.value
    this.GLOBAL_SCOPE[varName] = this.visit(node.right)
  }
  private visitVar(node: Var) {
    const varName = node.value
    const val = this.GLOBAL_SCOPE[varName]
    if (typeof val === 'undefined') {
      throw new Error(`variable ${varName} is undefined`)
    } else {
      return val
    }
  }
  private visitNoOp(node: NoOp) {
    // do nothing
  }
  private visitNum(node: Num) {
    return node.value
  }
}
