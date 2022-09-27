import { useState } from "@setsuna/setsuna"
import { resolveModelValue } from "./helpers/resolveModelValue"

export function useModel(value, pipes = []) {
  const [state, setState, input$] = useState(value, [resolveModelValue, ...pipes])
  const bindState = {
    value: state,
    onInput: setState,
    onChange: setState
  }
  return [state, bindState, setState]
}
