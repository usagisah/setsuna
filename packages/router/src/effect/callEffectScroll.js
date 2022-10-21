import { isPlainObject } from "@setsuna/share"
import { nextTick } from "@setsuna/setsuna"
import { error } from "../handler"

export function callEffectScroll(to, from, router) {
  const { scrollBehavior } = router
  const savedPosition = from.state.position

  try {
    if (!scrollBehavior) {
      to.state.position = savedPosition
      return
    }

    const res = scrollBehavior(to, from, savedPosition)
    if (!isPlainObject(res)) {
      return error(
        "scrollBehavior",
        "The return value of `scrollBehavior()` is not a legal return value",
        res
      )
    }

    to.state.position = res
  } catch (err) {
    error("afterEnter", "has a error", err)
  } finally {
    nextTick(() => {
      try {
        window.scrollTo(to.state.position)
      } catch (_) {}
    })
  }
}
