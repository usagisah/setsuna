import { isPlainObject } from "@setsuna/share"
import { nextTick } from "@setsuna/setsuna"
import { error } from "../handler"

export function callEffectScroll(router, to, from) {
  const { scrollBehavior } = router
  const savedPostion = from.state.position

  try {
    if (!scrollBehavior) {
      to.state.position = savedPostion
      return
    }

    const res = scrollBehavior(to, from, savedPostion)
    if (!isPlainObject(res)) {
      return error(
        "scrollBehavior",
        "The return value of `scrollBehavior()` is not a legal return value",
        res
      )
    }

    to.state.position = res
  } catch (err) {
    error("afterEnter", "has a Uncaptured exception", err)
  } finally {
    nextTick(() => {
      try {
        window.scrollTo(to.state.position)
      } catch (_) {}
    })
  }
}
