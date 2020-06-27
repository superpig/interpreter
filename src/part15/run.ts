import Lexer from './spi/lexer'
import Parser from './spi/parser'
import SemanticAnalyzer from './spi/semanticAnalyzer'
import Interpreter from './spi/interpreter'
;(function() {
  const text = `
PROGRAM Test;
VAR
    a : INTEGER;
VAR
    b : INTEGER;
BEGIN
  a := 5;
  b := a + 10;
END.
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
