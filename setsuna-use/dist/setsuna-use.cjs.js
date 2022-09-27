'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var setsuna = require('@setsuna/setsuna');

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]"
}

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
  const [state, setState, input$] = setsuna.useState(value, [resolveModelValue, ...pipes]);
  const bindState = {
    value: state,
    onInput: setState,
    onChange: setState
  };
  return [state, bindState, setState]
}

exports.useModel = useModel;
