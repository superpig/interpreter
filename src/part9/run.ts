import Lexer from './spi/lexer'
import Parser from './spi/parser'
import Interpreter from './spi/interpreter'
import * as readlineSync from 'readline-sync'
;(function() {
  while (true) {
    const expr = readlineSync.question('calc> ')
    const text = `BEGIN a := ${expr} END.`
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const interpreter = new Interpreter(parser)
    interpreter.interpret()
    const globals = interpreter.GLOBAL_SCOPE
    console.log(globals.a)
  }
})()
