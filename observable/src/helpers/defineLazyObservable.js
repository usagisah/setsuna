import { Observable } from "../Observable"

export function defineLazyObservable(fn = () => null, value) {
  if (typeof fn !== "function") {
    throw Error("[defineLazyObservable error]: `fn`不是一个合法的函数\n", fn)
  }
  const input$ = new Observable(value)
  const _subscript = input$.subscribe.bind(input$)
  input$.subscribe = function subscribe(sub) {
    _subscript(sub)
    fn(input$)
  }
  return input$
}
