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
    return `<${this.name}, ${this.type}>`
  }
}

class BuiltinTypeSymbol extends MySymbol {
  constructor(name: string) {
    super(name)
  }
  public toString() {
    return this.name
  }
}

class SymbolTable {
  private symbols: Map<string, any>
  constructor() {
    this.symbols = new Map()
    this.initBuildtins()
  }
  public define(symbol: MySymbol) {
    // console.log(`Define: ${symbol}`)
    this.symbols.set(symbol.name, symbol)
  }
  public lookup(name: string) {
    // console.log(`Lookup: ${name}`)
    const symbol = this.symbols.get(name)
    return symbol
  }
  public toString(): string {
    const symbols = []
    for (const value of this.symbols.values()) {
      symbols.push(value.toString())
    }
    return `Symbols：[${symbols}]`
  }
  private initBuildtins() {
    this.define(new BuiltinTypeSymbol('INTEGER'))
    this.define(new BuiltinTypeSymbol('REAL'))
  }
}

export default class SymbolTableBuilder extends NodeVisitor {
  public symtab: SymbolTable
  constructor() {
    super()
    this.symtab = new SymbolTable()
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
    } else if (node instanceof Program) {
      return this.visitProgram(node)
    } else if (node instanceof Block) {
      return this.visitBlock(node)
    } else if (node instanceof VarDecl) {
      return this.visitVarDecl(node)
    } else if (node instanceof ProcedureDecl) {
      return this.visitProcedureDecl(node)
    } else {
      const name = node && node.constructor.name
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
  private visitUnaryOp(node) {
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
      throw new ReferenceError(`${varName}`)
    }
  }
  private visitProcedureDecl(node) {
    // do nothing
  }
}
