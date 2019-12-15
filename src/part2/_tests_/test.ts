import Interpreter from '../index'

describe('Interpreter', () => {
  test('1+9', () => {
    const interpreter = new Interpreter('1+9')
    expect(interpreter.expr()).toBe(10)
  })
  test('11+9', () => {
    const interpreter = new Interpreter('11+9')
    expect(interpreter.expr()).toBe(20)
  })
  test('11 + 9', () => {
    const interpreter = new Interpreter('11 + 9')
    expect(interpreter.expr()).toBe(20)
  })
  test(' 11  +  9 ', () => {
    const interpreter = new Interpreter(' 11  +  9 ')
    expect(interpreter.expr()).toBe(20)
  })
  test(' 11  -  9 ', () => {
    const interpreter = new Interpreter(' 11  -  9 ')
    expect(interpreter.expr()).toBe(2)
  })
  test('throw error', () => {
    expect(() => {
      const interpreter = new Interpreter('1 + a')
      interpreter.expr()
    }).toThrow()
  })
})
