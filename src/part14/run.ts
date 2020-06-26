import Lexer from './spi/lexer'
import Parser from './spi/parser'
import SemanticAnalyzer from './spi/semanticAnalyzer'

;(function() {
  const text = `
program Main;
  var b, x, y : real;
  var z : integer;

  procedure AlphaA(a : integer);
     var b : integer;

     procedure Beta(c : integer);
        var y : integer;

        procedure Gamma(c : integer);
           var x : integer;
        begin { Gamma }
           x := a + b + c + x + y + z;
        end;  { Gamma }

     begin { Beta }

     end;  { Beta }

  begin { AlphaA }

  end;  { AlphaA }

  procedure AlphaB(a : integer);
     var c : real;
  begin { AlphaB }
     c := a + b;
  end;  { AlphaB }

begin { Main }
end.  { Main }
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
})()
