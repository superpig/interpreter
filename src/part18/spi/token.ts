// token 类型枚举
export enum TokenType {
  // 单字符 token 类型
  MUL = '*',
  PLUS = '+',
  MINUS = '-',
  FLOAT_DIV = '/',
  LPAREN = '(',
  RPAREN = ')',
  COLON = ':',
  COMMA = ',',
  SEMI = ';',
  DOT = '.',
  // block 保留字
  PROCEDURE = 'PROCEDURE',
  INTEGER = 'INTEGER', // 整数类型
  REAL = 'REAL', // 浮点数类型
  INTEGER_DIV = 'DIV',
  VAR = 'VAR',
  PROGRAM = 'PROGRAM',
  BEGIN = 'BEGIN',
  END = 'END',
  // 其他
  ID = 'ID',
  INTEGER_CONST = 'INTEGER_CONST',
  REAL_CONST = 'REAL_CONST',
  ASSIGN = ':=',
  EOF = 'EOF' // EOF 表示程序结束
}

export class Token {
  public type: TokenType
  public value: any
  public lineno: number
  public column: number
  constructor(type: TokenType, value: string | number, lineno: number = null, column: number = null) {
    this.type = type
    this.value = value
    this.lineno = lineno
    this.column = column
  }
  public toString(): string {
    return `Token(${this.type}, ${this.value}, position = ${this.lineno} : ${this.column})`
  }
}
