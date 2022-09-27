import { defineLazyObservable } from "./defineLazyObservable"

export function of(value, ...rest) {
  return defineLazyObservable(ob => {
    if (rest.length > 0) {
      const data = [value, ...rest]
      data.forEach(item => ob.next(item))
    } else if (
      typeof value === "object" &&
      value !== null &&
      "forEach" in value
    ) {
      value.forEach(item => ob.next(item))
    } else {
      ob.next(value)
    }
  })
}
