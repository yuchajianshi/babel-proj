const t = require('babel-types')

let hasReplaced = false

module.exports = {
  // Program(path) {
  //   if (hasReplaced) {
  //     return
  //   }
  //   hasReplaced = true
  //   let importState = t.ImportDeclaration(
  //     [
  //       t.ImportSpecifier(
  //         t.Identifier('wrapper'), 
  //         t.identifier('wrapper'))
  //     ], 
  //     t.stringLiteral('common')
  //   )
  //   path.replaceWith(
  //     t.program(
  //       [importState, ...path.node.body]
  //     )
  //   )
  // },
  ClassMethod(path) {
    if (path.node.async) {
      if (path.getData('replace')) { // 已经替换过
        return
      }
      path.setData('replace', true)
      let body = path.get('body')
      body.replaceWith(
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(
              t.identifier('wrapper'),
              [
                t.arrowFunctionExpression(
                  [], 
                  body.node, 
                  false
                )
              ]
            )
          )
        ])
      )

      if (hasReplaced) {
        return
      }
      hasReplaced = true

      let parent = path.findParent(pPath => {
        if (pPath.isProgram()) {
          return true
        }
      })
      
      let importState = t.ImportDeclaration(
        [
          t.ImportSpecifier(
            t.Identifier('wrapper'), 
            t.identifier('wrapper'))
        ], 
        t.stringLiteral('common')
      )
      parent.replaceWith(
        t.program(
          [importState, ...parent.node.body]
        )
      )
    }
  }
}