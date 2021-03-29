const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default
const parser = require("@babel/parser")
const plugin = require('./try-catch-plugin')
const fs = require('fs')
const arrowFunction = require('@babel/plugin-transform-arrow-functions').default

let data = fs.readFileSync('./input.js')
data = data.toString()

const code = `import aa from 'package'
class Compo {
  static async func() {
    console.log(1)
  }

  async doThing() {
    let a = 2
    let c = a + 2
  }

  async doAnotherThing() {
    console.log('heheda')
  }

  sayHello() {
    console.log('hello')
  }
}`

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['classProperties', 'jsx']
})

traverse(ast, plugin)

const output = generate(ast, {retainFunctionParens: true}, code)

console.log(output.code)
// fs.writeFileSync('./output.js', output.code)