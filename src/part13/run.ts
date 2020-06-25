import Lexer from './spi/lexer'
import Parser from './spi/parser'
import SemanticAnalyzer from './spi/semanticAnalyzer'

;(function() {
  const text = `
    program SymTab6;
      var x, y : integer;
      var y : real;
    begin
      x := x + y;
    end.
  `
  const lexer = new Lexer(text)
  const parser = new Parser(lexer)
  const tree = parser.parse()
  const semanticAnalyzer = new SemanticAnalyzer()
  try {
    semanticAnalyzer.visit(tree)
  } catch (err) {
    console.error(err)
  }
  console.log(semanticAnalyzer.symtab.toString())
})()
