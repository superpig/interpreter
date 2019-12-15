import Interpreter from './index'

const input = '1+2+3-1-3'
const interpreter = new Interpreter(input)
const result = interpreter.expr()
console.log(`input: ${input}`)
console.log(`result: ${result}`)
