
import path from "path"
import pluginJson from "@rollup/plugin-json"
import pluginReplace from "@rollup/plugin-replace"
import pluginCommonjs from "@rollup/plugin-commonjs"
import { nodeResolve as pluginNodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"

const { target, env, sourcemap } = process.env
if (!target) {
  throw new Error(
    "[build params error]: build pkg target is undefine, please specified target pkg"
  )
}

const sourceMap = JSON.parse(sourcemap)
const resolvePath = p => path.resolve(__dirname, "packages", target, p)

/* 
  {
      entity: [],
      format: ["es"],
      plugins: [],
      external: []
    }
*/
const pkgConfigs = {
  observable: {
    dev: {
      format: ["es"]
    },
    prod: {
      format: ["es", "cjs", "iife"]
    }
  },
  "plugin-setsuna": {
    dev: {
      format: ["es", "cjs"]
    },
    prod: {
      format: ["es", "cjs"]
    }
  },
  router: {
    dev: {
      format: ["es"]
    },
    prod: {
      format: ["es", "cjs", "iife"]
    }
  },
  setsuna: {
    dev: {
      entity: ["main", "server-renderer"],
      format: ["es"]
    },
    prod: {
      entity: ["main", "server-renderer"],
      format: ["es", "cjs", "iife"]
    }
  },
  ["setsuna-use"]: {
    dev: {
      format: ["es"]
    },
    prod: {
      format: ["es", "cjs", "iife"]
    }
  },
  share: {
    dev: {
      format: ["es"]
    },
    prod: {
      format: ["es", "cjs"]
    }
  }
}

function createBuildConfig() {
  const {
    entity = ["main"],
    format = ["cjs", "es"],
    plugins = [],
    external = []
  } = pkgConfigs[target][env]
  let DEV = true

  const createConfig = (entity, format, ext = "") => ({
    input: resolvePath(`src/${entity}.js`),
    external: ["@setsuna/setsuna", "@babel/core", "@setsuna/observable"].concat(
      external
    ),
    plugins: [
      pluginJson(),
      pluginReplace({
        preventAssignment: true,
        sourceMap: sourceMap,
        values: {
          __DEV__: DEV
        }
      }),
      ...(format === "cjs"
        ? [
            pluginCommonjs({
              sourceMap: sourceMap
            }),
            pluginNodeResolve()
          ]
        : []),
      ...plugins
    ],
    output: {
      name: target,
      sourcemap: sourceMap,
      externalLiveBindings: false,
      file: resolvePath(
        `dist/${entity === "main" ? target : entity}${ext}${
          format === "cjs" ? ".cjs" : format === "iife" ? ".global.js" : ".js"
        }`
      ),
      format
    },
    treeshake: { moduleSideEffects: false }
  })

  let configs = format
    .map(format => {
      return entity.map(entity => createConfig(entity, format))
    })
    .flat(Infinity)

  if (env === "prod") {
    DEV = false
    plugins.push(terser())
    configs = configs.concat(
      format
        .map(format => {
          return entity.map(entity => createConfig(entity, format, ".prod"))
        })
        .flat(Infinity)
    )
  }

  return configs
}

export default createBuildConfig()
