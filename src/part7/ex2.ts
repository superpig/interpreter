import Parser, { Num, BinOp, AST } from './spi/parser'
import Lexer from './spi/lexer'
import * as readlineSync from 'readline-sync'

export default class LISPTranslator {
  private parser: Parser
  constructor(parser: Parser) {
    this.parser = parser
  }
  public translate() {
    const tree = this.parser.parse()
    return this.visit(tree)
  }
  public visit(node: AST): string {
    if (node instanceof BinOp) {
      const left = this.visit(node.left)
      const right = this.visit(node.right)
      return `(${node.op.value} ${left} ${right})`
    } else if (node instanceof Num) {
      return node.value
    }
  }
}

if (process.env.name == '__main__'){
  ;(function() {
    while (true) {
      const text = readlineSync.question('input> ')
      if (text) {
        const lexer = new Lexer(text)
        const parser = new Parser(lexer)
        const translator = new LISPTranslator(parser)
        const result = translator.translate()
        console.info(result)
      }
    }
  })()
}
