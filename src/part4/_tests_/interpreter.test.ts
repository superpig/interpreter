import { Lexer } from '../parser'
import Interpreter from '../interpreter'

describe('parser', () => {
  function makeInterpreter(text: string) {
    const lexer = new Lexer(text)
    const interpreter = new Interpreter(lexer)
    return interpreter
  }
  test('test_expression1', () => {
    const interpreter = makeInterpreter('7 * 4 / 2')
    expect(interpreter.expr()).toBe(14)
  })
  test('test_expression2', () => {
    const interpreter = makeInterpreter('7 * 4 / 2 * 3')
    expect(interpreter.expr()).toBe(42)
  })
  test('test_expression3', () => {
    const interpreter = makeInterpreter('10 * 4  * 2 * 3 / 8')
    expect(interpreter.expr()).toBe(30)
  })
})
