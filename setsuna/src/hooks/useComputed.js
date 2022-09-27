import { isFunction, isPlainObject, noop } from "@setsuna/share"
import { error } from "../handler/errorHandler"
import { useEffect } from "./useEffect"
import { createState } from "./useState"

export function useComputed(subObs, options) {
  let getter, setter
  if (isPlainObject(options)) {
    getter = options.get ?? noop
    setter = options.set ?? noop
  } else {
    getter = options ?? noop
  }

  const { state, input$ } = createState(getter(), { noParam: true })
  const setState = newState => {
    if (!setter) {
      return error("hook-useComputed", "setter 修改器未定义，禁止修改")
    }
    isFunction(newState) ? setter(newState(state())) : setter(newState)
  }

  useEffect(subObs, () => input$.next(getter()))

  return [state, setState, input$]
}
