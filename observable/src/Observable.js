import { warnLog, errLog, normalizeOps, normalizeSubs } from "./helper.js"

export const RETURN = {
  SKIP: "_ob_return_skip",
  LOOP: "_ob_return_loop"
}

/* 
  1. 存在 pipe 用于挂载管道链
  2. 存在 subscribe 用户订阅上层推送的值
  3. subscribe 需要返回一个能取消订阅的函数
  4. 如果 closed() 函数用于，同步获取当前是否停止的 布尔值
  5. 存在 next 方法，用于推送正常值
  6. 存在 error 方法，用户推送异常值
  7. complete 方法，用于结束结束流的推送

  判断是否一个流
  是对象
  存在 pipe 方法
  存在 subscribe 方法

  基本使用
  const oo = new Observable()
  oo.pipe(fn1, fn2, fn3)
  ob.subscribe(fn)

  pipe
  写法
  1. pipe( value => newValue )
  2. pipe(
    next: value => newValue,
    error: error => { throw error },
    complete: () => null
  )
  行为同 promise，如果返回值是 promise 会透传
  如果错误流中，解决了会回到正常流，抛出错误则相当于透传

  subscribe
  写法
  1. pipe( value => newValue )
  2. pipe(
    next: value => newValue,
    error: error => { throw error },
    complete: () => null
  )
*/
export class Observable {
  #ops = []
  #subs = []
  #closed = false

  get closed() {
    return this.#closed
  }

  constructor(ob) {
    if (ob && isObservable(ob)) {
      ob.subscribe({
        next: nextValue => this.next(nextValue),
        error: nextError => this.error(nextError),
        complete: () => this.complete()
      })
    } else if (ob !== undefined) {
      warnLog("constructor", `${ob} is not Observable`)
    }
  }

  pipe(...operators) {
    this.#closed
      ? warnLog("pipe", "流已经被关闭，添加管道操作无效")
      : this.#ops.push(...normalizeOps(operators))
    return this
  }

  subscribe(sub) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    const _sub = normalizeSubs(sub)
    this.#subs.push(_sub)
    return function unSubscribe() {
      const index = this.#subs.indexOf(_sub)
      index > -1 && this.#subs.splice(index, 1)
    }
  }

  next(value) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    this.#callWithOperates("next", value)
  }

  error(error) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    this.#callWithOperates("error", error)
  }

  complete() {
    if (this.#closed) {
      return
    }
    this.#closed = true
    this.#callWithOperates("complete")
  }

  async #callWithOperates(type, value) {
    const originType = type
    const originValue = value

    for (const op of this.#ops) {
      try {
        let _value = op[type](value)

        if (_value instanceof Promise) {
          _value = await _value
        }
        if (_value === RETURN.SKIP) {
          break
        }
        if (_value === RETURN.LOOP) {
          this.#callWithOperates(originType, originValue)
          break
        }
        if (type !== "complete") {
          type = "next"
          value = _value
        }
      } catch (error) {
        if (type === "complete") {
          errLog("complete", "", op[type])
        } else {
          type = "error"
          value = error
        }
      }
    }

    this.#callWithSubscribes(type, value)
  }

  async #callWithSubscribes(type, value) {
    const subs = this.#subs.reduce(
      (subs, sub) => (type in sub && subs.push(sub[type]), subs),
      []
    )

    if (subs.length === 0 && type === "error") {
      return errLog("subscribe", "执行过程存在未处理的错误", value)
    }

    for (const sub of subs) {
      try {
        sub(value)
      } catch (e) {
        errLog("subscribe", `${sub.name}(${value})`, e)
      }
    }
  }
}

export function isObservable(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.pipe === "function" &&
    typeof value.subscribe === "function"
  )
}
