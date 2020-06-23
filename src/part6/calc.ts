import { Lexer } from './lexer'
import Interpreter from './interpreter'
import * as readlineSync from 'readline-sync'
;(function() {
  while (true) {
    const text = readlineSync.question('calc> ')
    if (text) {
      const lexer = new Lexer(text)
      const interpreter = new Interpreter(lexer)
      const result = interpreter.expr()
      console.log(`result: ${result}`)
    }
  }
})()
