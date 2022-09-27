import { resolveObservableState } from "@setsuna/share"
import { isFunction } from "@setsuna/share"
import { createState } from "./useState"

export function useRef(value) {
  const _input$ = resolveObservableState(value)
  const { state, input$ } = createState(_input$ ? _input$ : value, {
    noObserver: true
  })
  const setState = newState => {
    input$.next(isFunction(newState) ? newState(state()) : newState)
  }
  return [state, setState, input$]
}
