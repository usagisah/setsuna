export function injectImport({ result }) {
  const imported = new Set(["Fragment", "_jsx"])
  result.ast.program.body.forEach(node => {
    if (node.type !== "ImportDeclaration") return
    if (node.source.value !== "setsuna") return
    node.specifiers.forEach(({ type, local }) => {
      if (type === "ImportSpecifier") {
        if (local.name === "Fragment") imported.delete("Fragment")
        if (local.name === "_jsx") imported.delete("_jsx")
      }
    })
  })

  if (imported.size > 0) {
    const code = `import { ${[...imported].join(
      ","
    )} } from "@setsuna/setsuna"\n`
    result.code = code + result.code
  }
}
