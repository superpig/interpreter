import Parser, { Num, BinOp, AST, UaryOp } from './parser'
import { TokenType } from './token'
const { PLUS, MINUS, MUL, DIV } = TokenType

export abstract class NodeVisitor {
  abstract visit(node: AST)
}

/*
 * 解释器
 */
export default class Interpreter extends NodeVisitor {
  private parser: Parser
  constructor(parser: Parser) {
    super()
    this.parser = parser
  }
  public interpret() {
    const tree = this.parser.parse()
    if (!tree) return ''
    return this.visit(tree)
  }
  public visit(node: AST) {
    if (node instanceof BinOp) {
      return this.visitBinOp(node)
    } else if (node instanceof Num) {
      return this.visitNum(node)
    } else if (node instanceof UaryOp) {
      return this.visitUnaryOp(node)
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
  private visitNum(node: Num) {
    return node.value
  }
}
