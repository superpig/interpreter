import Lexer from './spi/lexer'
import Parser from './spi/parser'
import SemanticAnalyzer from './spi/semanticAnalyzer'
import Interpreter from './spi/interpreter'
;(function() {
  console.log(process.argv);
  const text = `
    program Main;
    var x, y : integer;
    begin { Main }
      y := 7;
      x := (y + 3) * 3;
    end.  { Main }
  `
  const lexer = new Lexer(text)
  const parser = new Parser(lexer)
  const tree = parser.parse()
  const semanticAnalyzer = new SemanticAnalyzer()
  try {
    semanticAnalyzer.visit(tree)
  } catch (err) {
    console.error(err.message)
  }
  const interpreter = new Interpreter(tree)
  interpreter.interpret()
})()
