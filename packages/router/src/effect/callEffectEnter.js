import { createRouteRecord } from "../createRouteRecord"
import { isString } from "@setsuna/share"
import { parseLocation } from "../parseLocation"
import { normalizeNavState } from "../history/web"
import { callEffectNavigate } from "./callEffectNavigate"

export function callEffectEnter(pathTmpl, router) {
  const { beforeEnter, his } = router
  const record = createRouteRecord(pathTmpl, router)
  const { redirect } = record.matchState
  if (redirect) {
    callEffectNavigate(
      parseLocation(normalizeNavState(redirect), router),
      router,
      record => router.his.setLocation(record, true)
    )
    throw null
  }

  const fromRecord = his.state.location
  const res = beforeEnter(record.state, fromRecord.state)
  if (isString(res)) {
    return callEffectEnter(parseLocation(normalizeNavState(res)), router)
  }

  if (res) {
    return record
  }

  throw null
}
