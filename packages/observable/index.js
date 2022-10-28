"use strict"

if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/observable.prod.cjs")
} else {
  module.exports = require("./dist/observable.cjs")
}
