import Lexer from './spi/lexer'
import Parser from './spi/parser'
import Interpreter from './spi/interpreter'
import * as readlineSync from 'readline-sync'
;(function() {
  while (true) {
    const text = readlineSync.question('calc> ')
    if (text) {
      const lexer = new Lexer(text)
      const parser = new Parser(lexer)
      const interpreter = new Interpreter(parser)
      const result = interpreter.interpret()
      console.log(`result: ${result}`)
    }
  }
})()
