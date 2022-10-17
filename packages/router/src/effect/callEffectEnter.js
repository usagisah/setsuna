import { createRouteRecord } from "../createRouteRecord"
import { isString } from "@setsuna/share"

export function callEffectEnter(toPath, router) {
  const { beforeEnter, his } = router
  const to = createRouteRecord(toPath, router)
  const from = his.state.location
  const res = beforeEnter(to, from)

  if (isString(res)) {
    return callEffectEnter(res, router)
  }

  if (res) {
    return to
  }

  throw null
}
