
const isDigit = candidate => '0' <= candidate && candidate <= '9'
const isHex = candidate => ('0' <= candidate && candidate <= '9') ||
                           ('A' <= candidate && candidate <= 'F') ||
                           ('a' <= candidate && candidate <= 'f')
const controlCharacters = [
  '\"', '\\', '\/', '\b', '\f', '\n', '\r', '\t']
const isControlCharacter = candidate =>
  controlCharacters.indexOf(candidate) > -1

class Input {

  constructor(serialized) {
    this.serialized = serialized
    this.ptr = 0

    this.row = 0
    this.col = 0
  }

  next(expected) {
    this.current = this.serialized.charAt(this.ptr++)

    if (this.current === '')
      this.reportError('Unexpected end of input')

    if (expected && expected != this.current)
      this.reportError(`Expected ${expected} but found ${this.current}`)

    return this.current
  }

  peek() {
    return this.serialized.charAt(this.ptr)
  }

  clearWhitespace() {
    while(this.peek() != '' && " \t\n".indexOf(this.peek()) >= 0)
      this.current = this.serialized.charAt(this.ptr++)
  }

  reportError(message = 'Unexpected Input') {
    const msg = this.serialized + '\n'
      + Array(this.ptr).join(" ") + '^\n'
      + message
    throw new Error(msg)
  }
}

function parseString(input) {
  input.next("\"")

  let str = ""
  while (input.peek() !== "\"") {
    if (input.peek() === '\\') {
      str += input.next()
      if (input.peek() === 'u') {
        for (let i = 0; i < 4; i++) {
          str += input.next()
          if (!isHex(input.peek())) input.reportError('Expected hexadecimal')
        }
      } else if (!isControlCharacter(input.peek())) {
        input.reportError(`Expected continuation of control character, but ` +
                          `found ${input.peek()}`)
      }
    } else if (isControlCharacter(input.peek())) {
      input.reportError(`Unescaped control character: ${input.peek()}`)
    }

    str += input.next()
  }
  input.next("\"")
  return str
}

function parseNumber(input) {
  const neg = input.peek() === '-' ? input.next('-') === '-' : false
  const peek = input.peek()

  let  number = ''
  if (isDigit(peek) && peek != '0') {
    while(isDigit(input.peek())) number += input.next()

  } else {
    if (peek != '0')
      input.reportError('Unexpected input; Expected 0')
    number = input.next()
  }

  if (input.peek() === '.') {
     number +=input.next()

    if (!isDigit(input.peek()))
      input.reportError('Unexpected input, Expected digit in decimal')

    while(isDigit(input.peek())) number += input.next()
  }

  if (input.peek() === 'e' || input.peek() === 'E') {
    number += input.next()

    if (input.peek() === '+' || input.peek() === '-')
      number += input.next()

    if (!isDigit(input.peek()))
      input.reportError('Unexpected input; Expected digit in exponent')

    while(isDigit(input.peek())) number += input.next()
  }

  return Number(number)
}

function parseArray(input, arr=[]) {
  input.next('[')
  input.clearWhitespace()

  if (input.peek() == ']') {
    input.next(']')
    return arr
  }

  arr.push(parseValue(input))
  input.clearWhitespace()

  while (input.peek() === ',') {
    input.next(',')
    arr.push(parseValue(input))
    input.clearWhitespace()
  }

  input.next(']')
  return arr
}

function parsePair(input, obj) {
  input.clearWhitespace()
  const key = parseString(input)
  input.clearWhitespace()
  input.next(':')
  obj[key] = parseValue(input)
  return obj
}

function parseObject(input, obj={}) {
  input.next("{")
  input.clearWhitespace()

  if (input.peek() === '}') {
    input.next('}')
    return obj
  }

  parsePair(input, obj)
  input.clearWhitespace()

  while (input.peek() === ',') {
    input.next(',')
    parsePair(input, obj)
    input.clearWhitespace()
  }

  input.next('}')
  return obj
}

function parseValue(input) {
  input.clearWhitespace()

  const peek = input.peek()
  switch(peek) {
  case '"':
    return parseString(input)
  case '{':
    return parseObject(input)
  case '[':
    return parseArray(input)
  case 't':
    input.next('t')
    input.next('r')
    input.next('u')
    input.next('e')
    return true
  case 'f':
    input.next('f')
    input.next('a')
    input.next('l')
    input.next('s')
    input.next('e')
    return false
  case 'n':
    input.next('n')
    input.next('u')
    input.next('l')
    input.next('l')
    return null
  default:
    if (peek === '-' || isDigit(peek))
      return parseNumber(input)
  }
  throw 'Unexpexted input'
}

function parse(inputString) {
  const input = new Input(inputString)
  let value = parseValue(input)

  input.clearWhitespace()

  if (inputString.length != input.ptr)
    input.reportError('Expected end of JSON.')

  return value
}

module.exports = {parse}

