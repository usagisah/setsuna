import { getCurrentInstance } from "../patch/patchOptions/component/currentInstance"
import { def, isFunction } from "@setsuna/share"
import { createState } from "./useState"

export function useProvide(key = `$$context(${key ?? id++})`, value) {
  const activeMountContext = getCurrentInstance()
  if (!activeMountContext) {
    throw "useProvide 只能在组件内部初始化时、顶层被调用"
  }

  const { state, input$ } = createState(value, { noObserver: true })
  function setState(newState) {
    input$.next(isFunction(newState) ? newState(state()) : newState)
  }

  activeMountContext.context[key] = { state, input$ }
  return [state, setState, input$]
}

export function useContext(key, value) {
  const activeMountContext = getCurrentInstance()
  if (!activeMountContext) {
    throw "useContext 只能在组件内部初始化时、顶层被调用"
  }

  const ctxValue = activeMountContext.context[key]
  const ctxState = function () {
    return ctxValue ? ctxValue.state() : value
  }
  def(ctxState, "input$", { get: () => ctxValue && ctxValue.input$ })
  def(ctxState, "state", { get: () => undefined })

  return ctxState
}

let id = 0
export function createContext(key) {
  const ctxKey = `$$context(${key ?? id++})`
  return [useProvide.bind(null, ctxKey), useContext.bind(null, ctxKey)]
}
