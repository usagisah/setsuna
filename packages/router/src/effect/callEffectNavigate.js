import { callEffectEnter } from "./callEffectEnter"
import { callEffectLoader } from "./callEffectLoader"
import { callEffectScroll } from "./callEffectScroll"
import { callEffectAfter } from "./callEffectAfter"

export function callEffectNavigate(router, toPath, callback) {
  const { matcher, beforeEnter, afterEnter } = router
  const { resolveRecordMatcher } = matcher

  try {
    const record = callEffectEnter(toPath, router)
    const matcher = resolveRecordMatcher(record)
    // callEffectLoader(record, matcher)
    // callEffectScroll(router)
    callback(record)
    // callEffectAfter(router, afterEnter)
  } catch (err) {
    if (err === null) return
    console.error("router error:", err)
  }
}
