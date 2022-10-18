import { createRouteRecord } from "../createRouteRecord"
import { isString } from "@setsuna/share"
import { parseLocation } from "../parseLocation"
import { normalizeNavState } from "../history/web"

export function callEffectEnter(pathTmpl, router) {
  const { beforeEnter, his } = router
  const record = createRouteRecord(pathTmpl, router)
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
