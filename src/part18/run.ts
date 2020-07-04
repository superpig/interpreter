import Lexer from './spi/lexer'
import Parser from './spi/parser'
import SemanticAnalyzer from './spi/semanticAnalyzer'
import Interpreter from './spi/interpreter'
;(function() {
  console.log(process.argv)
  const text = `
    program Main;

    procedure Alpha(a : integer; b : integer);
    var x : integer;
    begin
      x := (a + b ) * 2;
    end;

    begin { Main }

      Alpha(3 + 5, 7);  { procedure call }

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
