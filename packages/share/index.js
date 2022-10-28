"use strict"

if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/share.prod.cjs")
} else {
  module.exports = require("./dist/share.cjs")
}
