import { useState } from '@setsuna/setsuna';
import { isPlainObject } from '@setsuna/share';

function resolveModelValue(e) {
  if (e?.target) {
    return e.target.value
  } else if (isPlainObject(e) && "value" in e) {
    return e.value
  } else {
    return e
  }
}

function useModel(value, pipes = []) {
  const [state, setState, input$] = useState(value, [resolveModelValue, ...pipes]);
  const bindState = {
    value: state,
    onInput: setState,
    onChange: setState
  };
  return [state, bindState, setState]
}

export { useModel };
