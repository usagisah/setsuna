import { isFunction, isBrowser } from "@setsuna/share"
import { createRouterMatcher } from "./createRouterMatcher"
import { callEffectNavigate } from "./effect/callEffectNavigate"
import { createWebHistory } from "./history/web"
import { createMemoryHistory } from "./history/memory"
import { parseLocation } from "./parseLocation"


export function createBrowserRouter(options) {
  return createRouter("history", options, createWebHistory)
}

export function createHashRouter(options) {
  return createRouter("hash", options, createWebHistory)
}

export function createMemoryRouter(options) {
  return createRouter("memory", options, createMemoryHistory)
}

const DEFAULT_GUARD = () => true
let global_router = null

function createRouter(type, options, createHistory) {
  const { beforeEnter, afterEnter, scrollBehavior } = options
  const router = {
    type,
    beforeEnter: isFunction(beforeEnter) ? beforeEnter : DEFAULT_GUARD,
    afterEnter: isFunction(afterEnter) ? afterEnter : DEFAULT_GUARD,
    scrollBehavior: isFunction(scrollBehavior) ? scrollBehavior : null,
    options
  }

  if (isBrowser() && router.scrollBehavior) {
    history.scrollRestoration = "manual"
  }

  createRouterMatcher(router)
  createHistory(router)
  callEffectNavigate(parseLocation(null, router), router, record => {
    router.his.setLocation(record, true)
  })

  return (global_router = router)
}

export function useRouter() {
  return global_router
}

export function useNavigate() {
  return global_router.his.navigator
}
