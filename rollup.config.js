import path from "path"
import pluginJson from "@rollup/plugin-json"
import pluginReplace from "@rollup/plugin-replace"
import pluginCommonjs from "@rollup/plugin-commonjs"
import { nodeResolve as pluginNodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import { removeSync } from "fs-extra"

const { target, env } = process.env
if (!target) {
  throw new Error(
    "[build params error]: build pkg target is undefine, please specified target pkg"
  )
}

const sourcemap = JSON.parse(process.env.sourcemap)
const packageDir = path.resolve(__dirname, "packages", target)
const resolvePath = p => path.resolve(packageDir, p)
const name = target
const formats = ["es", "cjs"]

removeSync(resolvePath("dist"))

const createBuildConfig = () => {
  return formats
    .map(format => {
      return name !== "setsuna"
        ? [
            createConfig({
              name: `${name}.${format}`,
              entity: "main",
              format,
              plugins: []
            }),
            env === "prod" &&
              createConfig({
                name: `${name}.${format}.min`,
                entity: "main",
                format,
                plugins: [terser()]
              })
          ]
        : ["main", "external", "server-renderer"].map(item => [
            createConfig({
              name: item === "main" ? `${name}.${format}` : `${item}.${format}`,
              entity: item,
              format,
              ext: ".dev",
              plugins: []
            }),
            env === "prod" &&
              createConfig({
                name:
                  item === "main"
                    ? `${name}.${format}.min`
                    : `${item}.${format}.min`,
                entity: item,
                format,
                ext: ".prod",
                plugins: [terser()]
              })
          ])
    })
    .flat(Infinity)
    .filter(Boolean)
}

const pkgConfig = createBuildConfig()

export default pkgConfig

function createConfig({ name, entity, format, plugins = [] }) {
  return {
    input: resolvePath(`src/${entity}.js`),
    external: ["@setsuna/setsuna"],
    plugins: [
      pluginJson(),
      pluginReplace({
        preventAssignment: true,
        sourceMap: sourcemap,
        values: {
          __DEV__: (env === "dev").toString()
        }
      }),
      ...(format === "cjs"
        ? [
            pluginCommonjs({
              sourceMap: sourcemap
            }),
            pluginNodeResolve()
          ]
        : []),
      ...plugins
    ],
    output: {
      name,
      sourcemap,
      externalLiveBindings: false,
      file: resolvePath(`dist/${name}.js`),
      format
    },
    treeshake: { moduleSideEffects: false }
  }
}
