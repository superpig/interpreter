import { NodeVisitor } from './interpreter'
import { AST, BinOp, Num, UaryOp, Compound, Assign, NoOp, Var, Program, Block, VarDecl, ProcedureDecl, Type } from './parser'

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

class ProcedureSymbol extends MySymbol {
  public params: any[]
  constructor(name: string, params: any[] = null) {
    super(name)
    this.params = params || []
  }
  public toString(): string {
    return `<${this.constructor.name}(${this.name}, parameters: ${this.params})>`
  }
}

class ScopedSymbolTable {
  private symbols: Map<string, any>
  public scopeName: string
  public scopeLevel: number
  public enclosingScope: ScopedSymbolTable
  constructor(scopeName: string, scopeLevel: number, enclosingScope: ScopedSymbolTable) {
    this.symbols = new Map()
    this.scopeName = scopeName
    this.scopeLevel = scopeLevel
    this.enclosingScope = enclosingScope
  }
  public initBuildtins() {
    this.define(new BuiltinTypeSymbol('INTEGER'))
    this.define(new BuiltinTypeSymbol('REAL'))
  }
  public toString(): string {
    const h1 = 'SCOPE (SCOPED SYMBOL TABLE)'
    const lines = ['\n', h1, '='.repeat(h1.length)]
    const enclosingScope = this.enclosingScope && this.enclosingScope.scopeName && null
    const headers = [
      ['Scope name', this.scopeName],
      ['Scope level', this.scopeLevel],
      ['Enclosing scope', enclosingScope]
    ]
    for (const [name, value] of headers) {
      lines.push(`${name}: ${value}`)
    }
    const h2 = 'Scope (Scoped symbol table) contents'
    lines.push(...[h2, '-'.repeat(h2.length)])
    for (const [key, value] of this.symbols.entries()) {
      lines.push(`${key}: ${value}`)
    }
    lines.push('\n')
    return lines.join('\n')
  }
  public define(symbol) {
    console.log(`Insert: ${symbol.name}`)
    this.symbols.set(symbol.name, symbol)
  }
  public lookup(name, currentScopeOnly = false) {
    console.log(`Lookup: ${name} (Scope name: ${this.scopeName})`)
    const symbol = this.symbols.get(name)

    if (symbol) {
      return symbol
    }
    if (currentScopeOnly) {
      return null
    }
    if (this.enclosingScope) {
      return this.enclosingScope.lookup(name)
    }
  }
}

export default class SemanticAnalyzer extends NodeVisitor {
  public currentScope: ScopedSymbolTable
  constructor() {
    super()
    this.currentScope = null
  }
  public visitProgram(node: Program) {
    console.log('ENTER scope: global')
    const globalScope = new ScopedSymbolTable('global', 1, this.currentScope)
    globalScope.initBuildtins()
    this.currentScope = globalScope

    this.visit(node.block)

    console.log(globalScope.toString())
    this.currentScope = this.currentScope.enclosingScope
    console.log('LEAVE scope: global')
  }
  public visitBlock(node: Block) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }
  public visitBinOp(node: BinOp) {
    this.visit(node.left)
    this.visit(node.right)
  }
  public visitNum(node: Num) {
    // do nothing
  }
  public visitUaryOp(node: UaryOp) {
    this.visit(node.expr)
  }
  public visitCompound(node: Compound) {
    for (const child of node.children) {
      this.visit(child)
    }
  }
  public visitNoOp(node: NoOp) {
    // do nothing
  }
  public visitVarDecl(node: VarDecl) {
    const typeName = node.typeNode.value
    const typeSymbol = this.currentScope.lookup(typeName)

    const varName = node.varNode.value
    const varSymbol = new VarSymbol(varName, typeSymbol)

    if (this.currentScope.lookup(varName, true)) {
      throw new Error(`Error: Duplicate identifier ${varName} found`)
    }

    this.currentScope.define(varSymbol)
  }
  public visitAssign(node: Assign) {
    this.visit(node.left)
    this.visit(node.right)
  }
  public visitVar(node: Var) {
    const varName = node.value
    const varSymbol = this.currentScope.lookup(varName)
    if (!varSymbol) {
      throw new ReferenceError(`Error: Symbol(identifier) not found ${varName}`)
    }
  }
  public visitProcedureDecl(node: ProcedureDecl) {
    const procName = node.procName
    const procSymbol = new ProcedureSymbol(procName)
    this.currentScope.define(procSymbol)
    console.log(`ENTER scope: ${procName}`)

    const procedureScope = new ScopedSymbolTable(procName, this.currentScope.scopeLevel + 1, this.currentScope)
    this.currentScope = procedureScope

    for (const param of node.params) {
      const paramType = this.currentScope.lookup(param.typeNode.value)
      const paramName = param.varNode.value
      const varSymbol = new VarSymbol(paramName, paramType)
      this.currentScope.define(varSymbol)
      procSymbol.params.push(varSymbol)
    }
    this.visit(node.blockNode)
    console.log(procedureScope.toString())

    this.currentScope = this.currentScope.enclosingScope
    console.log(`LEAVE scope: ${procName}`)
  }
  public visitType(node: Type) {
    // do nothing
  }
}
