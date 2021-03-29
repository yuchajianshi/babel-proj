const t = require('babel-types')

module.exports = {
  ClassMethod(path) {
    if (path.node.async) {
      if (path.getData('replace')) { // 已经替换过
        return
      }
      path.setData('replace', true)
      
      let body = path.get('body')
      let v = t.blockStatement([
        t.tryStatement(
          body.node,
          t.catchClause(
            t.identifier('e'),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  t.identifier('fqm'),
                  [
                    t.memberExpression(
                      t.identifier('e'),
                      t.identifier('stack')
                    )
                  ]
                )
              )
            ])
          )
        )
      ])
      body.replaceWith(
        v
      )

      let program = path.findParent(node => {
        return node.isProgram()
      })
      if (!program.getData('replace')) {
        program.setData('replace', true)
        let importState = t.importDeclaration(
          [
            t.importDefaultSpecifier(
              t.identifier('fqm')
            )
          ],
          t.stringLiteral('fqm')
        )
        program.replaceWith(
          t.program([importState, ...program.node.body])
        )
        return
      }
    }
  }
}