import Parser, { Num, BinOp, AST } from './parser'
import { TokenType } from './token'
const { PLUS, MINUS, MUL, DIV } = TokenType

abstract class NodeVisitor {
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
    return this.visit(tree)
  }
  public visit(node: AST) {
    if (node instanceof BinOp) {
      return this.visitBinOp(node)
    } else if (node instanceof Num) {
      return this.visitNum(node)
    } else {
      throw new Error('No visit method')
    }
  }
  private visitBinOp(node: BinOp) {
    if (node.op.type === PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (node.op.type === MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (node.op.type === MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (node.op.type === DIV) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }
  private visitNum(node: Num) {
    return node.value
  }
}
