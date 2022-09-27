export function warnLog(type, message) {
  return console.warn(`[Observable ${type} warn]: ${message}`)
}
export function errLog(type, ...message) {
  return console.error(`[Observable ${type} has error]: ${message.join("\n")}`)
}
export function noop(value) {
  return value
}
export function noopError(error) {
  throw error
}

export function normalizeOps(ops) {
  return ops.reduce((result, op) => {
    if (typeof op === "function") {
      result.push({ next: op, error: noopError, complete: noop })
    } else if (typeof op === "object") {
      result.push({
        next: op.next ?? noop,
        error: op.error ?? noopError,
        complete: op.complete ?? noop
      })
    } else {
      errLog("pipe", "非法的管道操作符", op)
    }
    return result
  }, [])
}
export function normalizeSubs(sub) {
  if (typeof sub === "function") {
    return { next: sub }
  }
  if (typeof sub === "object") {
    return sub
  }
  errLog("subscribe", "非法的订阅函数", sub)
}
