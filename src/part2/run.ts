import Interpreter from './index'

const input = '12 / 10'
const interpreter = new Interpreter(input)
const result = interpreter.expr()
console.log(`input: ${input}`)
console.log(`result: ${result}`)
