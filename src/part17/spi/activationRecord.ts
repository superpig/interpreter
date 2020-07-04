export class CallStack {
  private records: ActivationRecord[]
  constructor() {
    this.records = []
  }
  public push(ar) {
    this.records.push(ar)
  }
  public pop() {
    return this.records.pop()
  }
  public peek() {
    return this.records[this.records.length - 1]
  }
  public toString() {
    let result = ''
    for (const item of this.records) {
      result += item.toString() + '\n'
    }
    result = 'CALL STACK\n' + result + '\n'
    return result
  }
}

export enum ARType {
  PROGRAM = 'PROGRAM'
}

/*
 * 活动记录
 */
export class ActivationRecord {
  public name: string
  public type: ARType
  public nestingLevel: number
  public members: Map<string, any>
  constructor(name: string, type: ARType, nestingLevel: number) {
    this.name = name
    this.type = type
    this.nestingLevel = nestingLevel
    this.members = new Map<string, any>()
  }
  public get(key: string) {
    return this.members.get(key)
  }
  public set(key: string, value: any) {
    this.members.set(key, value)
  }
  private setItem(key: string, value: any) {
    this.members.set(key, value)
  }
  private getItem(key: string, value: any) {
    return this.members.get(key)
  }
  public toString() {
    const lines = [`${this.nestingLevel}: ${this.type} ${this.name}`]
    for (const [key, value] of this.members.entries()) {
      lines.push(`    ${key}:   ${value}`)
    }
    return lines.join('\n')
  }
}
