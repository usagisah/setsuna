import { types, transformSync } from '@babel/core';
import crypto from 'crypto';

function createHash(content = "") {
  return crypto
    .createHmac("sha1", "setsuna")
    .update(content)
    .digest("hex")
    .slice(0, 8)
}

function injectHMR({ id, body }) {
  createHash(id);
  const componentNames = new Set();
  const hmrComponent = [];
  body.forEach(node => {
    let useNode = node;
    const isExport = isExportDeclaration(node);

    if (isExport && node.specifiers?.length > 0) {
      return node.specifiers.forEach(item => {
        const name = item.exported.name;
        componentNames.has(name) && hmrComponent.push(name);
      })
    }

    if (isExport) {
      node = useNode = node.declaration;
    }

    if (node.type === "VariableDeclaration") {
      node = node.declarations.at(-1);
      useNode = node.init;
    }

    const res = isAllowFunctionType(useNode, false);
    if (res) {
      if (!node.id) {
        return hmrComponent.push("__default__")
      }
      const name = node.id.name;
      componentNames.add(name);

      if (isExport) {
        hmrComponent.push(name);
      }
    }
  });

  //   let code = "\n"
  //   hmrComponent.forEach(name => {
  //     code += `\n__SETSUNA_HMR_MAP__.createRecord("${activeOptions.hmrId}")`
  //     code += `\nimport.meta.hot.accept(mods => {
  //   if (!mods) return;
  //   for (const key in mods) {
  //     const app = mods[key]
  //     __SETSUNA_HMR_MAP__.invokeReload(app._hmrId, app)
  //   }
  // })`
  //   })
  //   result.code += code
  body.unshift(
    ...hmrComponent.map(name => {
      return types.expressionStatement(
        types.assignmentExpression(
          "=",
          types.memberExpression(
            types.Identifier(name),
            types.Identifier("hmrId"),
            false
          ),
          types.stringLiteral(id)
        )
      )
    })
  );
}

function isExportDeclaration({ type }) {
  return ["ExportNamedDeclaration", "ExportDefaultDeclaration"].includes(type)
}

function isAllowFunction(node, done) {
  if (isAsync(node)) {
    return false
  }

  let body = node.body;
  if (body.type === "BlockStatement") {
    body = body.body;

    const returnStatement = body.find(node => node.type === "ReturnStatement");
    if (!returnStatement) {
      return false
    }

    if (!done) {
      return isAllowFunctionType(returnStatement.argument, true)
    }
  }

  switch (body.type) {
    case "JSXElement":
    case "NullLiteral":
    case "JSXFragment": {
      return true
    }
    default: {
      return false
    }
  }
}

function isAsync(node) {
  return node.async || node.generator
}

function isAllowFunctionType(node, done) {
  return [
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression"
  ].includes(node.type)
    ? isAllowFunction(node, done)
    : false
}

function injectImport({result}) {
  const imported = new Set(["Fragment", "_jsx"]);
  result.ast.program.body.forEach(node => {
    if (node.type !== "ImportDeclaration") return
    if (node.source.value !== "setsuna") return
    node.specifiers.forEach(({ type, local }) => {
      if (type === "ImportSpecifier") {
        if (local.name === "Fragment") imported.delete("Fragment");
        if (local.name === "_jsx") imported.delete("_jsx");
      }
    });
  });

  if (imported.size > 0) {
    const code = `import { ${[...imported].join(",")} } from "@setsuna/setsuna"\n`;
    result.code = code + result.code;
  }
}

function setsunaPlugin() {
  return {
    name: "vite:setsuna",

    config() {
      return {
        esbuild: {
          include: /\.ts$/
        }
      }
    },

    transform(source, id) {
      if (!id.endsWith("jsx")) return
      const result = transformSync(source, {
        ast: true,
        sourceMaps: true,
        sourceFileName: id,
        babelrc: false,
        configFile: false,
        plugins: [
          [
            require("@babel/plugin-transform-react-jsx"),
            {
              runtime: "classic",
              pragma: "_jsx",
              pragmaFrag: "Fragment",
              useBuiltIns: true
            }
          ],
          {
            visitor: {
              Program(path) {
                injectHMR({ id, body: path.node.body });
              },
              ImportSpecifier(path) {
                if (
                  path.parentPath.node.source.value === "@setsuna/setsuna" &&
                  path.node.imported.name === "render" &&
                  path.scope.getBinding("render").referencePaths.length > 0
                ) ;
              },
              ExportDefaultDeclaration(path, state) {
                if (!path.node.declaration.id) {
                  path.node.declaration.id = types.identifier("__default__");
                }
              }
            }
          }
        ]
      });

      injectImport({ result });
      return {
        code: result.code,
        map: result.map
      }
    }
  }
}

export { setsunaPlugin };
