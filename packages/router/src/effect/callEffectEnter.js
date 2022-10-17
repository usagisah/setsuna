import { createRouteRecord } from "../createRouteRecord"
import { isString } from "@setsuna/share"

export function callEffectEnter(toPath, router) {
  const { beforeEnter, history } = router
  const to = createRouteRecord(toPath, router)
  const from = history.state.route
  const res = beforeEnter(to, from)

  if (isString(res)) {
    return callEffectEnter(res, router)
  }

  if (res) {
    return to
  }

  throw null
}
