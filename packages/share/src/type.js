export function isFunction(value) {
  return typeof value === "function"
}

export function isString(value) {
  return typeof value === "string"
}

export function isBoolean(value) {
  return typeof value === "boolean"
}

export function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]"
}

export function isObject(value) {
  return typeof value === "object"
}

export const isArray = Array.isArray

export function isUndefined(value) {
  return value === void 0
}

export function isNumber(value) {
  return typeof value === "number"
}

export function isPromise(value) {
  return (
    value instanceof Promise &&
    isFunction(value.then) &&
    isFunction(value.catch)
  )
}

export function isSomeVNode(n1, n2) {
  return Object.is(n1.type, n2.type) && Object.is(n1.key, n2.key)
}
