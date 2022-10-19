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
    console.error("afterEnter error: ", err)
  }
}
