import { error } from "../handler"

export function callEffectAfter(router, from) {
  const {
    afterEnter,
    his: {
      state: { location }
    }
  } = router
  try {
    afterEnter(location, from)
  } catch (err) {
    error("afterEnter", "has a error", err)
  }
}
