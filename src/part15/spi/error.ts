import { Token } from './token'
// 错误码
export enum ErrorCode {
  UNEXPECTED_TOKEN = 'Unexpected token',
  ID_NOT_FOUND = 'Identifier not found',
  DUPLICATE_ID = 'Duplicate id found'
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
class MyError extends Error {
  public errorCode: string
  public token: Token
  constructor(errorCode: string = null, token: Token = null, message: string = null) {
    super(message)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
    this.errorCode = errorCode
    this.token = token
  }
}

export class LexerError extends MyError {
  constructor(errorCode: string = null, token: Token = null, message: string = null) {
    super(errorCode, token, message)
    this.name = 'LexerError'
  }
}

export class ParserError extends MyError {
  constructor(errorCode: string = null, token: Token = null, message: string = null) {
    super(errorCode, token, message)
    this.name = 'ParserError'
  }
}

export class SemanticError extends MyError {
  constructor(errorCode: string = null, token: Token = null, message: string = null) {
    super(errorCode, token, message)
    this.name = 'SemanticError'
  }
}
