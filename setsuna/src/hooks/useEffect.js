import { resolveObservableState } from "@setsuna/share"
import { isArray } from "@setsuna/share"
import { error } from "../handler/errorHandler"

export function useEffect(subObs, subscribe) {
  if (!isArray(subObs)) {
    return error(
      "观察者目标必须是一个 Array<Observable> | Array<State> 类型的数组"
    )
  }
  subObs.forEach(value => {
    const ob = resolveObservableState(value)
    ob
      ? ob.subscribe(subscribe)
      : error("订阅目标不是一个合法的 Observable state")
  })
}
