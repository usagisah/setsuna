import { error } from "../handler"

export function callEffectAfter(fromRecord, router) {
  const {
    afterEnter,
    his: {
      state: { location }
    }
  } = router
  try {
    afterEnter(location, fromRecord)
  } catch (err) {
    error("afterEnter", "has a error", err)
  }
}
