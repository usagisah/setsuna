import { callEffectEnter } from "./callEffectEnter"
import { callEffectLoader } from "./callEffectLoader"
import { callEffectScroll } from "./callEffectScroll"
import { callEffectAfter } from "./callEffectAfter"


export function callEffectNavigate(pathTmpl, router, callback) {
  const { matcher, his } = router
  const { resolveRecordMatcher } = matcher

  try {
    const record = callEffectEnter(pathTmpl, router)
    const fromRecord = his.state.location
    const matchs = resolveRecordMatcher(record)
    record.matchs = matchs

    // callEffectLoader(record, matcher)
    // callEffectScroll(router)
    callback(record)
    callEffectAfter(router, fromRecord)
  } catch (err) {
    if (err === null) return
    console.error("router error:", err)
  }
}
