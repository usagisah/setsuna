import { isFunction } from "@setsuna/share"
import { createRouterMatcher } from "./createRouterMatcher"
import { callEffectNavigate } from "./effect/callEffectNavigate"
import { createWebHistory } from "./history/web"
import { createMemoryHistory } from "./history/memory"
import { parseL, parseLocationocationparseLocation } from "./parseLocation"

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

function createRouter(type, options, createHistory) {
  const { beforeEnter, afterEnter } = options
  const router = {
    type,
    beforeEnter: isFunction(beforeEnter) ? beforeEnter : DEFAULT_GUARD,
    afterEnter: isFunction(afterEnter) ? afterEnter : DEFAULT_GUARD,
    options
  }

  createRouterMatcher(router)
  createHistory(router)
  callEffectNavigate(parseLocation(null, router), router, record => {
    router.his.setLocation(record, true)
  })

  return router
}