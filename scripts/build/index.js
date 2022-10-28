import { createRequire } from "module"
import { cpus } from "os"
import minimist from "minimist"
import fs from "fs-extra"
import path from "path"
const require = createRequire(import.meta.url)

import { execa } from "execa"
import chalk from "chalk"

const maxConcurrent = cpus().length

const args = minimist(process.argv.slice(2))
const { mod = "prod", sourcemap = false } = args
const targets = args._
if (targets.length === 0) {
  console.error(chalk.red("[build error]: Please specify as least one pkg. "))
  console.error(chalk.red("[build error]: 请至少指定一个包名. "))
  process.exit(0)
}

/* 
  build options:
    env: "dev" | "prod"  
      default:"prod"
    sourcemap: boolean
      default: true
*/
async function build() {
  const workingJobs = []
  for (const target of targets) {
    fs.removeSync(path.resolve(process.cwd(), "packages", target, "dist"))

    const promise = Promise.resolve(invokeBuild(target))
    if (maxConcurrent <= targets.length) {
      const job = promise.then(() =>
        workingJobs.splice(workingJobs.indexOf(job), 1)
      )
      workingJobs.push(job)

      if (workingJobs >= maxConcurrent) {
        await Promise.race(workingJobs)
      }
    }
  }
}

async function invokeBuild(pkg) {
  console.log(chalk.green(`build (${pkg}) start...`))
  await execa(
    "rollup",
    [
      "-c",
      "--environment",
      [`target:${pkg}`, `env:${mod}`, `sourcemap:${sourcemap}`].join(",")
    ],
    {
      stdio: "inherit"
    }
  )
}

build()
