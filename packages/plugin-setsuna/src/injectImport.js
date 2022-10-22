import { types } from "@babel/core"

export function injectImport(path) {
  path.node.body.unshift(
    types.importDeclaration(
      [
        types.ImportSpecifier(
          types.Identifier("_jsx"),
          types.Identifier("_jsx")
        ),
        types.ImportSpecifier(
          types.Identifier("Fragment"),
          types.Identifier("Fragment")
        )
      ],
      types.StringLiteral("@setsuna/setsuna")
    )
  )
}
