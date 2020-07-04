import { Num, BinOp, AST, UaryOp, NoOp, Compound, Assign, Var, Program, Block, VarDecl, Type, ProcedureDecl, ProcedureCall } from './parser'
import { TokenType } from './token'
import { CallStack, ActivationRecord, ARType } from './callStack'
const { PLUS, MINUS, MUL, INTEGER_DIV, FLOAT_DIV } = TokenType

export class NodeVisitor {
  public visit(node: AST) {
    const name = node && node.constructor.name
    const visitMethod = `visit${name}`
    if (this[visitMethod]) {
      return this[visitMethod](node)
    } else {
      throw new Error(`No visit${name} method`)
    }
  }
}

/*
 * 简单的 Pascal 解释器
 */
export default class Interpreter extends NodeVisitor {
  public callStack // 调用栈
  private tree: AST // AST 树
  constructor(tree: AST) {
    super()
    this.tree = tree
    this.callStack = new CallStack()
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
  public visitProgram(node: Program) {
    const programName = node.name

    this.log(`ENTER: PROGRAM ${programName}`)

    const ar = new ActivationRecord(programName, ARType.PROGRAM, 1)
    this.callStack.push(ar)

    this.log(this.callStack.toString())

    this.visit(node.block)

    this.log(`LEAVE: PROGRAM ${programName}`)
    this.log(this.callStack.toString())

    this.callStack.pop()
  }
  public visitBlock(node: Block) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }
  public visitBinOp(node: BinOp) {
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
  public visitUaryOp(node: UaryOp) {
    const op = node.op.type
    if (op === PLUS) {
      return +this.visit(node.expr)
    } else if (op === MINUS) {
      return -this.visit(node.expr)
    }
  }
  public visitAssign(node: Assign) {
    const varName = node.left.value
    const varVal = this.visit(node.right)
    const ar = this.callStack.peek()
    ar.set(varName, varVal)
  }
  public visitVar(node: Var) {
    const varName = node.value
    const ar = this.callStack.peek()
    const varValue = ar.get(varName)
    return varValue
  }
  public visitNoOp(node: NoOp) {
    // do nothing
  }
  public visitNum(node: Num) {
    return node.value
  }
  public visitVarDecl(node: VarDecl) {
    // do nothing
  }
  public visitType(node: Type) {
    // do nothing
  }
  public visitProcedureDecl(node: ProcedureDecl) {
    // do nothing
  }
  public visitProcedureCall(node: ProcedureCall) {
    // do nothing
  }
  public log(message: string) {
    if (process.env.LOG_STACK_SWITCH == 'open') {
      console.log(message)
    }
  }
}
