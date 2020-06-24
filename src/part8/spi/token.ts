// token 类型枚举
export enum TokenType {
  INTEGER = 'INTEGER',
  MUL = 'MUL',
  DIV = 'DIV',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  LPAREN = '(',
  RPAREN = ')',
  EOF = 'EOF' // EOF 表示程序结束
}

export class Token {
  public type: TokenType
  public value: any
  constructor(type: TokenType, value: string | number) {
    this.type = type
    this.value = value
  }
  public toString(): string {
    return `Token(${this.type}, ${this.value})`
  }
}
