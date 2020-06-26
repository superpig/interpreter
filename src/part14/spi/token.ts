// token 类型枚举
export enum TokenType {
  INTEGER = 'INTEGER', // 整数类型
  REAL = 'REAL', // 浮点数类型
  MUL = 'MUL',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  LPAREN = '(',
  RPAREN = ')',
  BEGIN = 'BEGIN',
  END = 'END',
  ID = 'ID',
  ASSIGN = 'ASSIGN',
  SEMI = 'SEMI',
  DOT = 'DOT',
  PROGRAM = 'PROGRAM',
  VAR = 'VAR',
  INTEGER_DIV = 'INTEGER_DIV',
  FLOAT_DIV = 'FLOAT_DIV',
  COLON = ':',
  COMMA = ',',
  INTEGER_CONST = 'INTEGER_CONST',
  REAL_CONST = 'REAL_CONST',
  PROCEDURE = 'PROCEDURE',
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
