import { types } from "@babel/core"

export const babelTransformPlugins = [
  [
    require("@babel/plugin-transform-react-jsx"),
    {
      runtime: "classic",
      pragma: "_jsx",
      pragmaFrag: "Fragment"
    }
  ],
  [
    {
      visitor: {
        ExportDefaultDeclaration(path, state) {
          if (!path.node.declaration.id) {
            path.node.declaration.id = types.identifier("__default__")
            path.stop()
          }
        }
      }
    }
  ]
]
