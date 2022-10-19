import { isPlainObject } from "@setsuna/share"

export function callEffectScroll(router, to, from) {
  const { scrollBehavior } = router
  const savedPostion = from.state.position

  if (!scrollBehavior) {
    to.state.position = savedPostion
    return
  }

  try {
    const res = scrollBehavior(to, from, savedPostion)
    if (!isPlainObject(res)) {
      return console.error("scroll error 不是合法的返回值")
    }

    to.state.position = res
  } catch (err) {
    console.error("afterEnter error: ", err)
  }
}
