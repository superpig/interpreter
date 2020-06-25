import { NodeVisitor } from './interpreter'
import { AST, BinOp, Num, UaryOp, Compound, Assign, NoOp, Var, Program, Block, VarDecl, ProcedureDecl } from './parser'

class MySymbol {
  public name: string
  public type: any
  constructor(name: string, type: any = null) {
    this.name = name
    this.type = type
  }
}

class VarSymbol extends MySymbol {
  constructor(name: string, type: any) {
    super(name, type)
  }
  public toString() {
    return `<${this.constructor.name}(${this.name}, ${this.type})>`
  }
}

class BuiltinTypeSymbol extends MySymbol {
  constructor(name: string) {
    super(name)
  }
  public toString() {
    return `<${this.constructor.name}(${this.name})>`
  }
}

class SymbolTable {
  private symbols: Map<string, any>
  constructor() {
    this.symbols = new Map()
    this.initBuildtins()
  }
  public define(symbol: MySymbol) {
    this.symbols.set(symbol.name, symbol)
  }
  public lookup(name: string) {
    const symbol = this.symbols.get(name)
    return symbol
  }
  public toString(): string {
    let result = 'Symbol Table：\n'
    for (const [key, value] of this.symbols.entries()) {
      const symbol = value.toString()
      result += `${key}: ${symbol}\n`
    }
    return result
  }
  private initBuildtins() {
    this.define(new BuiltinTypeSymbol('INTEGER'))
    this.define(new BuiltinTypeSymbol('REAL'))
  }
}

export default class SemanticAnalyzer extends NodeVisitor {
  public symtab: SymbolTable
  constructor() {
    super()
    this.symtab = new SymbolTable()
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
  private visitProgram(node) {
    this.visit(node.block)
  }
  private visitBlock(node) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }
  private visitBinOp(node: BinOp) {
    this.visit(node.left)
    this.visit(node.right)
  }
  private visitNum(node: Num) {
    // do nothing
  }
  private visitUaryOp(node) {
    this.visit(node.expr)
  }
  private visitCompound(node) {
    for (const child of node.children) {
      this.visit(child)
    }
  }
  private visitNoOp(node) {
    // do nothing
  }
  private visitVarDecl(node) {
    const typeName = node.typeNode.value
    const typeSymbol = this.symtab.lookup(typeName)

    const varName = node.varNode.value
    const varSymbol = new VarSymbol(varName, typeSymbol)

    if (this.symtab.lookup(varName)) {
      throw new Error(`Error: Duplicate identifier ${varName} found`)
    }

    this.symtab.define(varSymbol)
  }
  private visitAssign(node) {
    const varName = node.left.value
    const varSymbol = this.symtab.lookup(varName)
    if (typeof varSymbol === 'undefined') {
      throw new ReferenceError(`${varName}`)
    }
    this.visit(node.right)
  }
  private visitVar(node) {
    const varName = node.value
    const varSymbol = this.symtab.lookup(varName)
    if (typeof varSymbol === 'undefined') {
      throw new ReferenceError(`Error: Symbol(identifier) not found ${varName}`)
    }
  }
  private visitProcedureDecl(node) {
    // do nothing
  }
}
