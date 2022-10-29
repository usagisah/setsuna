import { isObservable } from "@setsunajs/observable"
import { isFunction, isPlainObject } from "./type"

export function resolveObservableState(value) {
  return isObservable(value)
    ? value
    : (isFunction(value) || isPlainObject(value)) && isObservable(value.input$)
    ? value.input$
    : undefined
}

export function resolveNextNodes(el, flag) {
  const open = []
  const nextNodes = [el]
  let next = getNextSibling(el)
  while (next) {
    nextNodes.push(next)

    if (next.nodeType != 8) {
      next = getNextSibling(next)
      continue
    }

    const content = next.textContent.trim()
    if (content === `/${flag}`) {
      if (open.length === 0) {
        return nextNodes
      } else {
        open.pop()
      }
    }
    next = getNextSibling(next)
  }
}

export const omit = (source, blackList) =>
  Object.keys(source).reduce((result, key) => {
    !blackList.includes(key) && (result[key] = source[key])
    return result
  }, {})

export const noop = value => value

export const noopError = error => {
  throw error
}

export const def = (target, key, options) =>
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    ...options
  })

export const isBrowser = () => typeof window
