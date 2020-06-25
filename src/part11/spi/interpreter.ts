import Parser, { Num, BinOp, AST, UaryOp, NoOp, Compound, Assign, Var, Program, Block, VarDecl, Type } from './parser'
import { TokenType } from './token'
const { PLUS, MINUS, MUL, INTEGER_DIV, FLOAT_DIV } = TokenType

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
  private tree: AST
  constructor(tree: AST) {
    super()
    this.tree = tree
    this.GLOBAL_SCOPE = {}
  }
  public interpret() {
    const tree = this.tree
    if (!tree) return ''
    return this.visit(tree)
  }
  public visitCompound(node: Compound) {
    for (const child of node.children) {
      this.visit(child)
    }
  }
  public visit(node: AST) {
    const name = node && node.constructor.name
    const visitMethod = `visit${name}`
    if (this[visitMethod]) {
      return this[visitMethod](node)
    } else {
      throw new Error(`No visit${name} method`)
    }
  }
  private visitProgram(node: Program) {
    this.visit(node.block)
  }
  private visitBlock(node: Block) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }
  private visitBinOp(node: BinOp) {
    const op = node.op.type
    if (op === PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (op === MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (op === MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (op === INTEGER_DIV) {
      return Math.floor(this.visit(node.left) / this.visit(node.right))
    } else if (op === FLOAT_DIV) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }
  private visitUaryOp(node: UaryOp) {
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
  private visitVarDecl(node) {
    // do nothing
  }
  private visitType(node) {
    // do nothing
  }
}
