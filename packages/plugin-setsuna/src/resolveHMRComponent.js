const isAllowArrowFunction = (node, done = false) => {
  if (isAsync(node)) return false
  if (done) return isAllowJsxType(node.body)

  let { body } = node
  let childNode = null
  if (body.type === "BlockStatement") {
    const returnNode = body.body.find(node => node.type === "ReturnStatement")
    if (!returnNode) {
      return false
    }

    childNode = returnNode.argument
  } else {
    childNode = body
  }

  return isAllowFunctionType(childNode, true)
}

const isAllowFunction = (node, done = false) => {
  if (isAsync(node)) return false

  const returnNode = node.body.body.find(
    node => node.type === "ReturnStatement"
  )
  if (!returnNode) {
    return
  }

  const childNode = returnNode.argument
  return done ? isAllowJsxType(childNode) : isAllowFunctionType(childNode, true)
}

const isAsync = node => node.async || node.generator

const isAllowJsxType = node => {
  return (
    node.type === "NullLiteral" ||
    (node.type === "CallExpression" && node.callee.name === "_jsx")
  )
}

const isAllowFunctionType = (node, done) => {
  if (node.type === "ArrowFunctionExpression") {
    return isAllowArrowFunction(node, done)
  } else if (
    ["FunctionDeclaration", "FunctionExpression"].includes(node.type)
  ) {
    return isAllowFunction(node, done)
  } else {
    return false
  }
}

const isExportDeclaration = type => {
  return ["ExportNamedDeclaration", "ExportDefaultDeclaration"].includes(type)
}

export function resolveHMRComponent(ast) {
  const componentNames = new Set()
  const hmrComponent = []
  ast.program.body.forEach(node => {
    let useNode = node
    const isExportType = isExportDeclaration(node.type)

    if (isExportType && node.specifiers?.length > 0) {
      return node.specifiers.forEach(item => {
        const name = item.exported.name
        componentNames.has(name) && hmrComponent.push(name)
      })
    }

    if (isExportType) {
      node = useNode = node.declaration
    }

    if (useNode.type === "VariableDeclaration") {
      node = useNode.declarations.at(-1)
      useNode = node.init
    }

    const bool = isAllowFunctionType(useNode, false)
    if (bool) {
      const name = node.id.name
      componentNames.add(name)

      if (isExportType) {
        hmrComponent.push(name)
      }
    }
  })
  return hmrComponent
}
