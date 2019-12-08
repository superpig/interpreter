import Interpreter from '../index'

describe('Interpreter', () => {
  test('correct case', () => {
    const interpreter = new Interpreter('1+9');
    expect(interpreter.expr()).toBe(10)
  })
  test('throw error', () => {
    expect(() => {
      const interpreter = new Interpreter('1+a');
      interpreter.expr()
    }).toThrow()
  })
})

