export function callEffectAfter(router, from) {
  const {afterEnter, his} = router
  try {
    afterEnter(his.state.location, from)
  }
  catch(err) {
    console.error("afterEnter error: ", err)
  }
}
