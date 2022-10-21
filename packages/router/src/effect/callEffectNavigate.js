import { callEffectEnter } from "./callEffectEnter"
import { callEffectLoader } from "./callEffectLoader"
import { callEffectScroll } from "./callEffectScroll"
import { callEffectAfter } from "./callEffectAfter"
import { error } from "../handler"


export function callEffectNavigate(pathTmpl, router, callback) {
  const { matcher, his } = router
  const { resolveRecordMatcher } = matcher

  try {
    const record = callEffectEnter(pathTmpl, router)
    const fromRecord = his.state.location
    const matchs = resolveRecordMatcher(record)
    record.matchs = matchs
    
    callEffectLoader(record)
    callback(record)
    callEffectAfter(fromRecord, router)
    callEffectScroll(record, fromRecord, router)
  } catch (err) {
    if (err === null) return
    error("", "router has a uncaught exceptions", err)
  }
}
