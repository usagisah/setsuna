"use strict"

if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/plugin-setsuna.prod.cjs")
} else {
  module.exports = require("./dist/plugin-setsuna.cjs")
}
